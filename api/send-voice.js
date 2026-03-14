// /api/send-voice.js — Vercel Serverless Function
// Called by Vercel Cron at 7:30 AM IST and 4:30 PM IST

const { prernaBasePlan, mohitBasePlan, generateMorningScript, generateEveningScript, getDayName } = require("../lib/meals");

module.exports = async function handler(req, res) {
  // Verify this is a cron call or has auth
  const authHeader = req.headers["authorization"];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const day = getDayName();

  // Skip weekends
  if (day === "Saturday" || day === "Sunday") {
    return res.json({ status: "skipped", reason: "Weekend — no meals for Noor" });
  }

  // Determine which meal slot based on current IST time
  const now = new Date();
  const istHour = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getHours();
  
  // Allow manual override via query param: ?slot=morning or ?slot=evening
  let slot = req.query.slot;
  if (!slot) {
    slot = istHour < 12 ? "morning" : "evening";
  }

  const prerna = prernaBasePlan[day];
  const mohit = mohitBasePlan[day];

  if (!prerna || !mohit) {
    return res.json({ status: "skipped", reason: `No meal plan for ${day}` });
  }

  // Generate Hindi script
  let script;
  if (slot === "morning") {
    script = generateMorningScript(day, prerna, mohit);
  } else {
    script = generateEveningScript(day, prerna, mohit);
    if (day === "Friday") {
      return res.json({ status: "skipped", reason: "Friday dinner — eating out" });
    }
  }

  console.log(`[${day} ${slot}] Script:\n${script}`);

  try {
    // Step 1: Generate audio via ElevenLabs
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!elevenLabsKey || !voiceId) {
      return res.status(500).json({ error: "Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID" });
    }

    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsKey,
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_v3",
        voice_settings: { stability: 0.75, similarity_boost: 0.8 },
        output_format: "mp3_44100_128", // We'll convert to OGG for WhatsApp voice note
      }),
    });

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      console.error("ElevenLabs error:", errText);
      return res.status(500).json({ error: "ElevenLabs TTS failed", details: errText });
    }

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    console.log(`Audio generated: ${audioBuffer.length} bytes`);

    // Step 2: Upload audio to a publicly accessible URL
    // We'll use Vercel Blob if available, otherwise base64 encode for Twilio
    // For now, use a simple approach: upload to tmpfiles.org or use Twilio's MediaUrl
    // Twilio can accept audio via MediaUrl — we need a public URL
    
    // Use Vercel Blob storage
    let mediaUrl;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (blobToken) {
      // Upload to Vercel Blob
      const { put } = require("@vercel/blob");
      const filename = `noor-${day.toLowerCase()}-${slot}-${Date.now()}.mp3`;
      const blob = await put(filename, audioBuffer, {
        access: "public",
        token: blobToken,
        contentType: "audio/mpeg",
      });
      mediaUrl = blob.url;
      console.log(`Uploaded to Vercel Blob: ${mediaUrl}`);
    } else {
      // Fallback: upload to tmpfiles.org (temporary public URL)
      const FormData = (await import("form-data")).default;
      const form = new FormData();
      form.append("file", audioBuffer, { filename: "voice.mp3", contentType: "audio/mpeg" });

      const uploadResp = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: form,
      });
      const uploadData = await uploadResp.json();
      // tmpfiles.org returns URL like https://tmpfiles.org/12345/voice.mp3
      // Direct URL needs /dl/ prefix
      mediaUrl = uploadData.data?.url?.replace("tmpfiles.org/", "tmpfiles.org/dl/");
      console.log(`Uploaded to tmpfiles: ${mediaUrl}`);
    }

    if (!mediaUrl) {
      return res.status(500).json({ error: "Failed to upload audio to public URL" });
    }

    // Step 3: Send via Twilio WhatsApp
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM; // whatsapp:+14155238886
    const noorPhone = process.env.NOOR_WHATSAPP_NUMBER;   // whatsapp:+91XXXXXXXXXX

    if (!twilioSid || !twilioAuth || !twilioFrom || !noorPhone) {
      return res.status(500).json({ error: "Missing Twilio credentials" });
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const twilioBody = new URLSearchParams({
      From: twilioFrom,
      To: noorPhone,
      MediaUrl: mediaUrl,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioBody.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (twilioResult.error_code) {
      console.error("Twilio error:", twilioResult);
      return res.status(500).json({ error: "Twilio send failed", details: twilioResult });
    }

    console.log(`✅ Voice note sent to Noor! SID: ${twilioResult.sid}`);

    return res.json({
      status: "sent",
      day,
      slot,
      script,
      messageSid: twilioResult.sid,
      audioUrl: mediaUrl,
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
