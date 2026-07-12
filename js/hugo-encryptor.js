(function () {
  "use strict";

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function bytesFromBase64(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  async function deriveKey(password, salt, iterations) {
    const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  }

  async function decryptBlock(block, password) {
    const key = await deriveKey(
      password,
      bytesFromBase64(block.dataset.salt),
      Number(block.dataset.iterations)
    );
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytesFromBase64(block.dataset.nonce), tagLength: 128 },
      key,
      bytesFromBase64(block.dataset.ciphertext)
    );
    return decoder.decode(plaintext);
  }

  function storageKey(block) {
    return "hugo-encryptor:" + location.pathname + ":" + block.dataset.blockId;
  }

  function updatePageLock() {
    const locked = document.querySelector(".hugo-encryptor[data-state='locked']");
    document.body.classList.toggle("hugo-encryptor-locked", Boolean(locked));
    document.body.classList.toggle("hugo-encryptor-unlocked", !locked);
  }

  async function unlock(block, password, remember) {
    const error = block.querySelector(".hugo-encryptor-error");
    const button = block.querySelector("button");
    if (!password) {
      error.textContent = "请输入密码。";
      return false;
    }
    button.disabled = true;
    error.textContent = "正在验证…";
    try {
      const html = await decryptBlock(block, password);
      const content = block.querySelector(".hugo-encryptor-content");
      content.innerHTML = html;
      block.querySelector(".hugo-encryptor-prompt").hidden = true;
      content.hidden = false;
      block.dataset.state = "unlocked";
      delete block.dataset.ciphertext;
      delete block.dataset.salt;
      delete block.dataset.nonce;
      error.textContent = "";
      if (remember) sessionStorage.setItem(storageKey(block), password);
      updatePageLock();
      document.dispatchEvent(new CustomEvent("hugo-encryptor:unlocked", { detail: { block } }));
      return true;
    } catch (exception) {
      error.textContent = "密码错误，请重试。";
      if (remember) sessionStorage.removeItem(storageKey(block));
      return false;
    } finally {
      button.disabled = false;
    }
  }

  function initialize(root) {
    (root || document).querySelectorAll(".hugo-encryptor[data-state='locked']").forEach((block) => {
      if (block.dataset.initialized === "true") return;
      block.dataset.initialized = "true";
      const form = block.querySelector("form");
      const input = block.querySelector("input[type='password']");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (await unlock(block, input.value, true)) input.value = "";
      });
      const saved = sessionStorage.getItem(storageKey(block));
      if (saved) unlock(block, saved, true);
    });
    updatePageLock();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initialize(document), { once: true });
  } else {
    initialize(document);
  }
  document.addEventListener("pjax:complete", () => initialize(document));
  window.HugoEncryptor = { initialize };
})();
