const http = require("http");

const TOTAL_LOAD_USERS = 100;
const API_HOST = "localhost";
const API_PORT = 5000;

console.log("=================================================");
console.log("🚀 STARTING CONCURRENT LOAD TEST FOR 100 REGISTRATIONS");
console.log("=================================================");

function makeHttpRequest(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function runLoadTest() {
  const startTime = Date.now();

  try {
    // Step 1: Clear existing registrations for clean test baseline
    console.log("🧹 Step 1: Clearing registrations for clean load test baseline...");
    await makeHttpRequest({
      host: API_HOST,
      port: API_PORT,
      path: "/api/registrations",
      method: "DELETE",
    });

    // Step 2: Set event capacity limit to 150
    console.log("⚙️ Step 2: Setting max spots limit to 150...");
    await makeHttpRequest(
      {
        host: API_HOST,
        port: API_PORT,
        path: "/api/settings",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      },
      { maxSpots: 150 }
    );

    // Step 3: Generate 100 unique registration payloads
    console.log(`📦 Step 3: Preparing ${TOTAL_LOAD_USERS} concurrent registration payloads...`);
    const payloadBatch = Array.from({ length: TOTAL_LOAD_USERS }).map((_, index) => {
      const regNo = `9923004${String(1000 + index).padStart(4, "0")}`;
      return {
        uid: `load-uid-${index + 1}`,
        name: `LOAD TEST STUDENT ${index + 1}`,
        email: `student${index + 1}@klu.ac.in`,
        registerNumber: regNo,
        phone: `98765${String(10000 + index).slice(0, 5)}`,
        department: index % 3 === 0 ? "CSE (AI & ML)" : index % 2 === 0 ? "CSE" : "ECE",
        year: index % 2 === 0 ? "III Year" : "II Year",
        transactionId: `UTR9923004${String(1000 + index).padStart(4, "0")}`,
        paymentScreenshot: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80",
        cloudinaryPublicId: `claim-group-3/payment-screenshots/${regNo}`,
      };
    });

    // Step 4: Fire 100 Concurrent Registration POST requests simultaneously
    console.log(`⚡ Step 4: Dispatching ${TOTAL_LOAD_USERS} concurrent HTTP POST requests to backend...`);
    const requestStart = Date.now();

    const results = await Promise.all(
      payloadBatch.map((payload) =>
        makeHttpRequest(
          {
            host: API_HOST,
            port: API_PORT,
            path: "/api/registrations",
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
          payload
        )
      )
    );

    const requestEnd = Date.now();
    const durationMs = requestEnd - requestStart;
    const durationSec = durationMs / 1000;

    // Analyze Load Test Performance
    const successCount = results.filter((r) => r.statusCode === 201).length;
    const failureCount = results.filter((r) => r.statusCode !== 201).length;
    const requestsPerSecond = (TOTAL_LOAD_USERS / durationSec).toFixed(2);

    console.log("\n=================================================");
    console.log("📊 LOAD TEST RESULTS SUMMARY");
    console.log("=================================================");
    console.log(`✅ Total Registrations Attempted : ${TOTAL_LOAD_USERS}`);
    console.log(`🟢 Successful Registrations     : ${successCount} / ${TOTAL_LOAD_USERS}`);
    console.log(`🔴 Failed Requests               : ${failureCount}`);
    console.log(`⏱️ Total Execution Time          : ${durationMs} ms (${durationSec.toFixed(3)} seconds)`);
    console.log(`⚡ Throughput (RPS)              : ${requestsPerSecond} req/sec`);
    console.log(`🏎️ Average Latency Per Request   : ${(durationMs / TOTAL_LOAD_USERS).toFixed(2)} ms`);

    // Step 5: Duplicate Prevention Check under load
    console.log("\n🛡️ Step 5: Verifying Duplicate Prevention under load...");
    const dupResponse = await makeHttpRequest(
      {
        host: API_HOST,
        port: API_PORT,
        path: "/api/registrations",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      payloadBatch[0] // Duplicate registration
    );

    if (dupResponse.statusCode === 409) {
      console.log("✅ Duplicate prevention verified: Rejected duplicate registration with HTTP 409 Conflict!");
    } else {
      console.log(`⚠️ Unexpected duplicate test status code: ${dupResponse.statusCode}`);
    }

    // Step 6: Verify Final Total Registrations Count
    const finalGet = await makeHttpRequest({
      host: API_HOST,
      port: API_PORT,
      path: "/api/registrations",
      method: "GET",
    });

    const currentTotal = finalGet.body.registrations.length;
    console.log(`📈 Final Total Database Registrations Count: ${currentTotal}`);
    console.log(`🎯 Remaining Available Spots out of 150     : ${150 - currentTotal}`);

    if (successCount === TOTAL_LOAD_USERS && currentTotal === TOTAL_LOAD_USERS) {
      console.log("\n🎉 LOAD TEST 100% PASSED & VERIFIED!");
    } else {
      console.log("\n⚠️ Load test completed with warnings.");
    }
  } catch (err) {
    console.error("❌ Load test failed with error:", err.message);
  }
}

runLoadTest();
