const output = document.getElementById("output");

async function callEndpoint(path) {
  output.textContent = `Calling ${path}…`;

  try {
    const res = await fetch(path, {
      headers: { Accept: "application/json" },
    });

    const contentType = res.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    const display = {
      status: res.status,
      statusText: res.statusText,
      headers: {},
      body,
    };

    const paymentRequired = res.headers.get("payment-required");
    const paymentResponse = res.headers.get("payment-response");
    if (paymentRequired) display.headers["payment-required"] = paymentRequired;
    if (paymentResponse) display.headers["payment-response"] = paymentResponse;

    output.textContent = JSON.stringify(display, null, 2);

    if (res.status === 402) {
      output.textContent +=
        "\n\n→ This is an x402 Payment Required response.\n" +
        "  A real client (or AI agent) would now sign a USDC payment\n" +
        "  and retry the request with the PAYMENT-SIGNATURE header.";
    }
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
}

function callBrief() {
  const input = document.getElementById("topicInput");
  const topic = (input?.value || "x402 payments").trim() || "x402 payments";
  const encoded = encodeURIComponent(topic);
  callEndpoint(`/api/brief?topic=${encoded}`);
}

// Allow pressing Enter in the topic field
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("topicInput");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") callBrief();
    });
  }
});
