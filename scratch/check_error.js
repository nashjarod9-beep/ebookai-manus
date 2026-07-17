const http = require('http');

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const list = await getJson('http://localhost:9222/json/list');
    if (list.length === 0) {
      console.error("No pages found in remote debugging list.");
      return;
    }
    const wsUrl = list[0].webSocketDebuggerUrl;
    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected. Enabling domains...");
      ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
      ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
      ws.send(JSON.stringify({ id: 3, method: "Log.enable" }));
      
      console.log("Navigating to http://localhost:5173/...");
      ws.send(JSON.stringify({ 
        id: 4, 
        method: "Page.navigate", 
        params: { url: "http://localhost:5173/" } 
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      // Print console API calls
      if (msg.method === "Runtime.consoleAPICalled") {
        const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a));
        console.log(`[Browser Console] [${msg.params.type}]`, ...args);
      }

      // Print exceptions
      if (msg.method === "Runtime.exceptionThrown") {
        console.error("[Browser Exception]", msg.params.exceptionDetails.exception.description || msg.params.exceptionDetails.text);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    // Close after 6 seconds of capturing logs
    setTimeout(() => {
      console.log("Closing test script...");
      ws.close();
      process.exit(0);
    }, 6000);

  } catch (error) {
    console.error("Failed to run check script:", error);
    process.exit(1);
  }
}

run();
