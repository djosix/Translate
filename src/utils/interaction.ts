export function content<T>(data: object): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id!, data, (response: T) => {
        if (chrome.runtime.lastError) {
          reject({
            request: data,
            error: chrome.runtime.lastError,
          });
          return;
        }
        resolve(response);
      });
    });
  });
}

export async function background<T>(request: object): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(request, (response: T) => {
      if (chrome.runtime.lastError) {
        reject({
          request,
          error: chrome.runtime.lastError,
        });
        return;
      }
      resolve(response);
    });
  });
}
