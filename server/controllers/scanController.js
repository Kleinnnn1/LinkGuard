const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const axios = require("axios");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const followRedirects = async (url) => {
  try {
    const redirectResponse = await axios.get(url, {
      maxRedirects: 10,
      timeout: 8000,
      validateStatus: () => true,
    });
    return redirectResponse.request?.res?.responseUrl || url;
  } catch (redirectError) {
    console.warn("Redirect resolution failed, using original URL:", redirectError.message);
    return url;
  }
};

const checkUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required." });

  try {
    // Step 1: Resolve the final URL after following all redirects
    const finalUrl = await followRedirects(url);
    console.log(`Original URL: ${url}`);
    console.log(`Resolved URL: ${finalUrl}`);

    // Step 2: Build threat entries — check both original and final URL
    const threatEntries = [{ url }];
    if (finalUrl !== url) {
      threatEntries.push({ url: finalUrl });
    }

    // Step 3: Check against Google Safe Browsing API
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_API_KEY}`,
      {
        client: {
          clientId: "qr-safety-scanner",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION",
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries,
        },
      }
    );

    const isMalicious =
      response.data.matches && response.data.matches.length > 0;
    const status = isMalicious ? "malicious" : "safe";

    // Step 4: Save scan result to database
    await prisma.scan.create({
      data: { url, result: status },
    });

    // Step 5: Return result along with the resolved URL for transparency
    res.json({ status, resolvedUrl: finalUrl });
  } catch (error) {
    console.error("Scan error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const getHistory = async (req, res) => {
  try {
    const scans = await prisma.scan.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const mapped = scans.map((scan) => ({
      id: scan.id,
      url: scan.url,
      status: scan.result,
      scannedAt: scan.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { checkUrl, getHistory };