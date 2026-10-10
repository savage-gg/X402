import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 4020;
const PAY_TO = process.env.PAY_TO_ADDRESS;
const FACILITATOR_URL = process.env.FACILITATOR_URL || "https://x402.org/facilitator";

// Base Sepolia (testnet) – safe for demos
const NETWORK = "eip155:84532";

if (!PAY_TO || PAY_TO === "0xYourWalletAddressHere") {
  console.warn(
    "\n⚠️  WARNING: Set a real PAY_TO_ADDRESS in your .env file before accepting real payments!\n" +
      "   Using a placeholder address for now – payments will fail until you update it.\n"
  );
}

const app = express();

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Create facilitator client + resource server
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitatorClient).register(
  NETWORK,
  new ExactEvmScheme()
);

// ──────────────────────────────────────────────
// x402 Payment Middleware
// Protect specific routes with micropayments
// ──────────────────────────────────────────────
app.use(
  paymentMiddleware(
    {
      // On-demand topic brief – $0.01 USDC
      // Example: GET /api/brief?topic=solana+defi
      "GET /api/brief": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: NETWORK,
            payTo: PAY_TO || "0x0000000000000000000000000000000000000000",
          },
        ],
        description: "On-demand structured brief for any topic (AI-style research summary)",
        mimeType: "application/json",
      },

      // Cheap micropayment data feed – $0.001
      "GET /api/premium-data": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: NETWORK,
            payTo: PAY_TO || "0x0000000000000000000000000000000000000000",
          },
        ],
        description: "Premium structured data feed",
        mimeType: "application/json",
      },
    },
    resourceServer
  )
);

// ──────────────────────────────────────────────
// Free routes
// ──────────────────────────────────────────────
app.get("/api/free", (_req, res) => {
  res.json({
    message: "This endpoint is free – no payment required.",
    tip: "Try GET /api/brief?topic=your+topic or /api/premium-data to see x402 in action.",
    examples: [
      "/api/brief?topic=x402+payments",
      "/api/brief?topic=solana+defi",
      "/api/brief?topic=ai+agents",
    ],
  });
});

// ──────────────────────────────────────────────
// Paid routes (middleware already handled payment)
// ──────────────────────────────────────────────

/**
 * Useful paid endpoint: On-demand topic brief
 * Usage: GET /api/brief?topic=solana+defi
 *
 * Returns a structured research-style brief.
 * In a real product you would call an LLM or data source here.
 * For this demo we generate a high-quality structured response
 * based on the topic so the endpoint is actually useful for testing.
 */
app.get("/api/brief", (req, res) => {
  const topic = (req.query.topic || "general technology trends").toString().trim().slice(0, 120);

  // Simple but useful structured generator (replace with real LLM/API in production)
  const brief = generateBrief(topic);

  res.json({
    success: true,
    paid: true,
    price: "$0.01 USDC",
    network: "Base Sepolia",
    request: {
      topic,
      generatedAt: new Date().toISOString(),
    },
    brief,
    meta: {
      note: "Unlocked via x402 payment. In production this would call a real research/LLM pipeline.",
      howToUse: "Pass ?topic=your+subject to get a tailored brief.",
    },
  });
});

app.get("/api/premium-data", (_req, res) => {
  res.json({
    success: true,
    paid: true,
    price: "$0.001 USDC",
    data: {
      temperature: 72,
      condition: "sunny",
      humidity: 45,
      location: "Demo City",
      source: "x402-protected feed",
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Generates a realistic structured brief from a topic.
 * This is intentionally useful for demos and testing agent flows.
 * Swap this function for a real LLM call or data API later.
 */
function generateBrief(topic) {
  const normalized = topic.toLowerCase();

  // Lightweight keyword-based enrichment so responses feel relevant
  const isCrypto = /crypto|bitcoin|ethereum|solana|defi|stablecoin|x402|blockchain|web3/.test(normalized);
  const isAI = /ai|agent|llm|gpt|machine learning|neural/.test(normalized);
  const isPayments = /payment|pay|commerce|micropayment|x402|checkout/.test(normalized);

  let keyPoints = [];
  let outlook = "";
  let risks = [];
  let actionItems = [];

  if (isPayments || isCrypto) {
    keyPoints = [
      "Machine-to-machine payments are moving from theory to production with protocols like x402.",
      "Stablecoins (especially USDC) dominate micropayment volume because of speed and low fees.",
      "HTTP-native payment flows remove the need for accounts and API keys for many use cases.",
    ];
    outlook = "Expect rapid growth in agent-driven commerce as more APIs adopt open payment standards.";
    risks = [
      "Regulatory uncertainty around automated spending by agents",
      "Need for robust wallet security and spending limits",
    ];
    actionItems = [
      "Add x402 middleware to high-value API endpoints",
      "Test agent payment flows on testnet before mainnet",
      "Monitor facilitator reliability and settlement times",
    ];
  } else if (isAI) {
    keyPoints = [
      "AI agents are increasingly capable of autonomous tool use and decision making.",
      "The missing piece has been the ability to pay for resources without human approval loops.",
      "Combining agents with native payment protocols unlocks new economic activity.",
    ];
    outlook = "Agentic systems that can both reason and transact will create new markets for data, compute, and services.";
    risks = [
      "Uncontrolled spending by poorly constrained agents",
      "Quality and hallucination risks when agents consume paid data",
    ];
    actionItems = [
      "Define clear spending policies and budgets for agents",
      "Prefer verifiable, structured data sources over free-form text",
      "Log every paid request for auditability",
    ];
  } else {
    keyPoints = [
      `Interest in "${topic}" continues to grow across technical and business communities.`,
      "Structured, on-demand briefs are valuable for both humans and automated agents.",
      "Pay-per-use models align incentives better than subscriptions for sporadic research needs.",
    ];
    outlook = `Further developments related to ${topic} are likely to accelerate as tooling and distribution improve.`;
    risks = [
      "Information quality varies widely across free sources",
      "Stale data can lead to poor decisions",
    ];
    actionItems = [
      "Validate key claims against primary sources",
      "Set up recurring paid briefs for topics you track closely",
      "Combine this endpoint with your own internal data for higher signal",
    ];
  }

  return {
    title: `Brief: ${topic}`,
    summary: `A concise, structured overview of current dynamics around "${topic}", generated on demand after an x402 payment.`,
    keyPoints,
    outlook,
    risks,
    actionItems,
    confidence: "medium (demo generator – replace with real research pipeline)",
    tags: [isCrypto ? "crypto" : null, isAI ? "ai" : null, isPayments ? "payments" : null, "x402"].filter(Boolean),
  };
}

// Fallback – serve the frontend for any other route
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n🚀 x402 Demo Website running at http://localhost:${PORT}`);
  console.log(`   Receiving payments at: ${PAY_TO || "(not set)"}`);
  console.log(`   Network: Base Sepolia (testnet)`);
  console.log(`   Facilitator: ${FACILITATOR_URL}`);
  console.log(`\n   Free endpoint:     GET /api/free`);
  console.log(`   Paid endpoints:    GET /api/brief?topic=...  ($0.01)`);
  console.log(`                      GET /api/premium-data     ($0.001)`);
  console.log(`\n   Open http://localhost:${PORT} in your browser\n`);
});
