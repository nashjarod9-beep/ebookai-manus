const { spawn } = require('child_process');
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

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("1. Starting Vite development server...");
  const viteProcess = spawn('npm', ['run', 'dev'], { 
    cwd: 'c:/Users/user/Downloads/CREATE EBOOK/ebookai/frontend',
    shell: true
  });

  await wait(4000); // Wait for Vite

  console.log("2. Starting Google Chrome...");
  const chromeProcess = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:/Users/user/Downloads/CREATE EBOOK/chrome_profile_test_4',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding'
  ]);

  await wait(4000); // Wait for Chrome

  try {
    console.log("3. Querying Chrome debug targets...");
    const targets = await getJson('http://localhost:9222/json/list');
    
    // Connect to target of type "page"
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) {
      throw new Error("No page target found. Targets: " + JSON.stringify(targets));
    }
    
    const wsUrl = pageTarget.webSocketDebuggerUrl;
    console.log("Connecting to WebSocket page target:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected. Enabling Page and Runtime...");
      ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
      ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
      
      console.log("Navigating...");
      ws.send(JSON.stringify({ 
        id: 3, 
        method: "Page.navigate", 
        params: { url: "http://localhost:5173/" } 
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("Received event:", msg.method || `ID: ${msg.id}`);
      
      if (msg.method === "Runtime.consoleAPICalled") {
        console.log(`[Browser Console] [${msg.params.type}]`, ...msg.params.args.map(a => a.value || a.description || JSON.stringify(a)));
      } else if (msg.method === "Runtime.exceptionThrown") {
        console.error("❌ [Browser Exception]", msg.params.exceptionDetails.exception.description || msg.params.exceptionDetails.text);
      } else if (msg.method === "Page.loadEventFired") {
        console.log("🎉 Page loadEventFired!");
        ws.send(JSON.stringify({
          id: 100,
          method: "Runtime.evaluate",
          params: { expression: "document.body.innerHTML" }
        }));
      }

      if (msg.id === 100) {
        console.log("DOM Body HTML:", msg.result.result.value);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    // Wait 12 seconds
    await wait(12000);
    ws.close();

  } catch (error) {
    console.error("Test error:", error);
  } finally {
    chromeProcess.kill();
    viteProcess.kill();
    console.log("Finished.");
    process.exit(0);
  }
}

main();
