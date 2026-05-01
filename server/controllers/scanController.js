const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const axios = require("axios");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const checkUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required." });

  try {
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
          threatEntries: [{ url }],
        },
      }
    );

    const isMalicious = response.data.matches && response.data.matches.length > 0;
    const status = isMalicious ? "malicious" : "safe";

    await prisma.scan.create({
      data: { url, result: status },
    });

    res.json({ status });
  } catch (error) {
    console.error(error);
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
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { checkUrl, getHistory };