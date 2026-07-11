/**
 * YouTube 逐字稿采集器 — Frontend Logic
 * Pure vanilla JS, no framework dependencies.
 */

// API_BASE is defined in index.html (auto-detects local vs github.io)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = {
  jobId: null,
  pollTimer: null,
  videos: [],
};

// ---------------------------------------------------------------------------
// DOM refs (cached on init)
// ---------------------------------------------------------------------------
let dom = {};

// ---------------------------------------------------------------------------
// Error code → user-friendly message mapping
// ---------------------------------------------------------------------------
const ERROR_MESSAGES = {
  INVALID_URL: "链接无法识别，请确认是 YouTube 频道、播放列表或视频链接。",
  UNSUPPORTED_URL: "暂不支持该链接类型。",
  VIDEO_LIST_FAILED: "视频列表获取失败，请检查链接后重试。",
  SUBTITLE_NOT_FOUND: "没有可用字幕。",
  YTDLP_FAILED: "视频信息提取失败，请稍后重试。",
  JOB_TIMEOUT: "任务处理超时，请减少视频数量后重试。",
  ZIP_FAILED: "资料包生成失败，请重新创建任务。",
  NOT_FOUND: "任务或文件不存在。",
  NOT_READY: "任务尚未完成，请等待处理完毕后再下载。",
  INTERNAL_ERROR: "服务器内部错误，请稍后重试。",
  FORBIDDEN: "禁止访问该路径。",
};

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
function init() {
  cacheDom();
  bindEvents();
  hideSection("progress-section");
  hideSection("results-section");
  hideSection("download-section");
  closeTranscriptModal(false);

  // Resume polling if URL has ?job_id=xxx
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job_id");
  if (jobId) {
    state.jobId = jobId;
    showSection("progress-section");
    startPolling(jobId);
  }
}

function cacheDom() {
  dom = {
    sourceUrl: document.getElementById("source-url"),
    maxVideos: document.getElementById("max-videos"),
    languages: document.getElementById("languages"),
    subtitleMode: document.getElementById("subtitle-mode"),
    startBtn: document.getElementById("start-btn"),
    btnText: document.querySelector("#start-btn .btn-text"),
    spinner: document.querySelector("#start-btn .spinner"),

    progressSection: document.getElementById("progress-section"),
    statusLabel: document.getElementById("status-label"),
    statusMessage: document.getElementById("status-message"),
    progressBar: document.getElementById("progress-bar"),
    progressPercent: document.getElementById("progress-percent"),
    statTotal: document.getElementById("stat-total"),
    statProcessed: document.getElementById("stat-processed"),
    statSuccess: document.getElementById("stat-success"),
    statNosub: document.getElementById("stat-nosub"),
    statFailed: document.getElementById("stat-failed"),

    resultsSection: document.getElementById("results-section"),
    videoTbody: document.getElementById("video-tbody"),
    filterBtns: document.querySelectorAll(".filter-btn"),

    downloadSection: document.getElementById("download-section"),
    downloadBtn: document.getElementById("download-btn"),

    toast: document.getElementById("toast"),
    modal: document.getElementById("transcript-modal"),
    modalTitle: document.getElementById("modal-title"),
    modalLang: document.getElementById("modal-lang"),
    modalSource: document.getElementById("modal-source"),
    modalBody: document.getElementById("modal-body"),
  };
}

function bindEvents() {
  dom.startBtn.addEventListener("click", handleStartClick);
  dom.downloadBtn.addEventListener("click", handleDownloadClick);

  // Filter buttons
  dom.filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      dom.filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadAndRenderVideos(btn.dataset.filter || null);
    });
  });

  // Modal
  document.getElementById("modal-close").addEventListener("click", closeTranscriptModal);
  dom.modal.addEventListener("click", (e) => {
    if (e.target === dom.modal) closeTranscriptModal();
  });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTranscriptModal();
  });
}

// ---------------------------------------------------------------------------
// Form validation & job creation
// ---------------------------------------------------------------------------
function validateForm() {
  const url = dom.sourceUrl.value.trim();
  if (!url) {
    showToast("请输入 YouTube 链接。", "error");
    return false;
  }
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    showToast("请输入有效的 YouTube 链接。", "error");
    return false;
  }
  return true;
}

function getFormPayload() {
  const langVal = dom.languages.value;
  let languages;
  if (langVal === "all") languages = ["all"];
  else languages = [langVal];

  return {
    url: dom.sourceUrl.value.trim(),
    languages: languages,
    subtitle_mode: dom.subtitleMode.value,
    max_videos: parseInt(dom.maxVideos.value, 10),
    no_subtitle_strategy: "skip",
    relevance_keywords: [],
  };
}

async function handleStartClick() {
  if (!validateForm()) return;

  setButtonLoading(true);
  clearToast();

  try {
    const payload = getFormPayload();
    const result = await createJob(payload);
    state.jobId = result.job_id;

    // Switch UI
    hideSection("config-section");
    hideSection("results-section");
    hideSection("download-section");
    showSection("progress-section");
    resetProgressUI();
    updateStatusUI("pending", "等待处理");

    // Update URL so refresh resumes
    const newUrl = new URL(window.location);
    newUrl.searchParams.set("job_id", result.job_id);
    window.history.replaceState({}, "", newUrl);

    startPolling(result.job_id);
  } catch (err) {
    setButtonLoading(false);
    showToast(err.message || "任务创建失败，请稍后重试。", "error");
  }
}

function resetProgressUI() {
  dom.progressBar.style.width = "0%";
  dom.progressPercent.textContent = "0%";
  dom.statTotal.textContent = "0";
  dom.statProcessed.textContent = "0";
  dom.statSuccess.textContent = "0";
  dom.statNosub.textContent = "0";
  dom.statFailed.textContent = "0";
}

// ---------------------------------------------------------------------------
// Button loading state
// ---------------------------------------------------------------------------
function setButtonLoading(loading) {
  if (loading) {
    dom.startBtn.disabled = true;
    dom.btnText.classList.add("hidden");
    dom.spinner.classList.remove("hidden");
  } else {
    dom.startBtn.disabled = false;
    dom.btnText.classList.remove("hidden");
    dom.spinner.classList.add("hidden");
  }
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------
async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    throw new Error("无法连接到服务器，请检查网络或后端是否已启动。");
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = (body && body.detail) || body || {};
    const code = detail.error || "UNKNOWN";
    const msg = ERROR_MESSAGES[code] || detail.message || "操作失败，请稍后重试。";
    throw new Error(msg);
  }

  return body;
}

async function createJob(payload) {
  return apiRequest("/api/youtube/jobs/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function pollJob(jobId) {
  return apiRequest(`/api/youtube/jobs/${jobId}`);
}

async function fetchVideos(jobId, statusFilter) {
  let path = `/api/youtube/jobs/${jobId}/videos`;
  if (statusFilter) path += `?status=${encodeURIComponent(statusFilter)}`;
  return apiRequest(path);
}

async function fetchTranscript(videoDbId) {
  return apiRequest(`/api/youtube/videos/${videoDbId}/transcript`);
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------
function startPolling(jobId) {
  stopPolling();
  pollJobAndUpdate(jobId); // Immediate first call
  state.pollTimer = setInterval(() => pollJobAndUpdate(jobId), 2500);
}

function stopPolling() {
  if (state.pollTimer) {
    clearInterval(state.pollTimer);
    state.pollTimer = null;
  }
}

async function pollJobAndUpdate(jobId) {
  try {
    const job = await pollJob(jobId);
    updateProgressUI(job);

    if (job.status === "completed") {
      stopPolling();
      updateStatusUI("completed", "已完成");
      showSection("download-section");
      showSection("results-section");
      await loadAndRenderVideos(null);
    } else if (job.status === "failed") {
      stopPolling();
      updateStatusUI("failed", "任务失败");
      showToast(job.error_message || "任务执行失败，请重试。", "error");
      setButtonLoading(false);
      showSection("config-section");
    } else if (job.status === "cancelled") {
      stopPolling();
      updateStatusUI("cancelled", "已取消");
      setButtonLoading(false);
      showSection("config-section");
    }
  } catch (err) {
    stopPolling();
    showToast(err.message, "error");
    setButtonLoading(false);
    showSection("config-section");
  }
}

// ---------------------------------------------------------------------------
// Progress UI
// ---------------------------------------------------------------------------
function updateProgressUI(job) {
  const total = job.total_videos || 0;
  const processed = job.processed_videos || 0;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

  dom.progressBar.style.width = `${pct}%`;
  dom.progressPercent.textContent = `${pct}%`;
  dom.statTotal.textContent = total;
  dom.statProcessed.textContent = processed;
  dom.statSuccess.textContent = job.success_count || 0;
  dom.statNosub.textContent = job.no_subtitle_count || 0;
  dom.statFailed.textContent = job.failed_count || 0;
  dom.statusMessage.textContent = job.message || "";

  updateStatusUI(job.status, job.message || job.status);
}

function updateStatusUI(status, text) {
  dom.statusLabel.textContent = text;

  // Remove all status classes
  dom.statusLabel.className = "status-badge";

  const processing = [
    "pending",
    "fetching_videos",
    "downloading_subtitles",
    "converting",
    "packing",
  ];
  if (processing.includes(status)) {
    dom.statusLabel.classList.add("status-processing");
  } else if (status === "completed") {
    dom.statusLabel.classList.add("status-completed");
  } else if (status === "failed") {
    dom.statusLabel.classList.add("status-failed");
  } else if (status === "cancelled") {
    dom.statusLabel.classList.add("status-cancelled");
  } else {
    dom.statusLabel.classList.add("status-pending");
  }
}

// ---------------------------------------------------------------------------
// Video table
// ---------------------------------------------------------------------------
async function loadAndRenderVideos(filterStatus) {
  if (!state.jobId) return;
  try {
    const result = await fetchVideos(state.jobId, filterStatus);
    state.videos = result.items || [];
    renderVideoTable(state.videos);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function renderVideoTable(videos) {
  const tbody = dom.videoTbody;
  tbody.innerHTML = "";

  if (!videos.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">暂无视频数据</td></tr>';
    return;
  }

  videos.forEach((v) => {
    const tr = document.createElement("tr");

    // Title (link to YouTube)
    const titleTd = document.createElement("td");
    const titleLink = document.createElement("a");
    titleLink.href = v.url || `https://www.youtube.com/watch?v=${v.video_id}`;
    titleLink.target = "_blank";
    titleLink.rel = "noopener";
    titleLink.textContent = v.title || "(无标题)";
    titleTd.appendChild(titleLink);
    tr.appendChild(titleTd);

    // Date
    tr.appendChild(createTd(v.upload_date || "-"));

    // Duration
    tr.appendChild(createTd(formatDuration(v.duration)));

    // Subtitle status tag
    const statusTd = document.createElement("td");
    statusTd.appendChild(createStatusTag(v.subtitle_status, v.status));
    tr.appendChild(statusTd);

    // Languages
    const langs = v.subtitle_languages || [];
    tr.appendChild(createTd(langs.length ? langs.join(", ") : "-"));

    // Source tag
    tr.appendChild(createTd(createSourceLabel(v.transcript_source)));

    // Actions
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("actions");

    const viewBtn = document.createElement("button");
    viewBtn.classList.add("btn-sm");
    viewBtn.textContent = "查看";
    viewBtn.addEventListener("click", () => openTranscriptModal(v));
    actionsTd.appendChild(viewBtn);

    if (v.subtitle_status && v.subtitle_status !== "none" && v.subtitle_status !== "failed") {
      const dlBtn = document.createElement("button");
      dlBtn.classList.add("btn-sm");
      dlBtn.textContent = "下载 TXT";
      dlBtn.addEventListener("click", () => downloadSingleTranscript(v));
      actionsTd.appendChild(dlBtn);
    }

    const ytBtn = document.createElement("button");
    ytBtn.classList.add("btn-sm");
    ytBtn.textContent = "打开视频";
    ytBtn.addEventListener("click", () => {
      window.open(v.url || `https://www.youtube.com/watch?v=${v.video_id}`, "_blank");
    });
    actionsTd.appendChild(ytBtn);

    tr.appendChild(actionsTd);
    tbody.appendChild(tr);
  });
}

function createTd(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function createStatusTag(subtitleStatus, videoStatus) {
  const span = document.createElement("span");
  span.classList.add("tag");

  if (subtitleStatus === "manual" || subtitleStatus === "auto" || subtitleStatus === "mixed") {
    span.classList.add("tag-success");
    span.textContent = "✅ 已获取";
  } else if (subtitleStatus === "none") {
    span.classList.add("tag-nosub");
    span.textContent = "⚠️ 无字幕";
  } else if (videoStatus === "failed") {
    span.classList.add("tag-failed");
    span.textContent = "❌ 失败";
  } else if (videoStatus === "processing" || videoStatus === "pending") {
    span.classList.add("tag-pending");
    span.textContent = "⏳ 处理中";
  } else {
    span.classList.add("tag-pending");
    span.textContent = videoStatus || "-";
  }
  return span;
}

function createSourceLabel(source) {
  if (!source || source === "none") return "-";
  const span = document.createElement("span");
  span.classList.add("tag");
  if (source === "manual") {
    span.classList.add("tag-manual");
    span.textContent = "人工";
  } else if (source === "auto") {
    span.classList.add("tag-auto");
    span.textContent = "自动";
  } else if (source === "mixed") {
    span.classList.add("tag-manual");
    span.textContent = "混合";
  } else {
    span.textContent = source;
  }
  return span.outerHTML;
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Modal (transcript viewer)
// ---------------------------------------------------------------------------
async function openTranscriptModal(video) {
  dom.modalTitle.textContent = video.title || "逐字稿";
  dom.modalLang.textContent = (video.subtitle_languages || ["en"]).join(", ") || "en";
  dom.modalSource.textContent = video.transcript_source || "auto";
  dom.modalBody.innerHTML = '<p class="loading-text">加载中...</p>';
  dom.modal.classList.remove("hidden");
  document.getElementById("modal-close").focus();

  try {
    const data = await fetchTranscript(video.video_id || video.id);
    // The API returns the video_db_id path. If we have a video object with id,
    // we use that; otherwise the API call above won't work.
    dom.modalBody.textContent = data.text || "(逐字稿为空)";
  } catch (err) {
    // If fetching by video_id fails, try the database ID if available
    if (video.id && video.id !== video.video_id) {
      try {
        const data = await fetchTranscript(video.id);
        dom.modalBody.textContent = data.text || "(逐字稿为空)";
        return;
      } catch (e2) {
        // fall through
      }
    }
    dom.modalBody.innerHTML =
      '<p class="loading-text" style="color:#dc2626">逐字稿加载失败，请稍后重试。</p>';
  }
}

function closeTranscriptModal(focusTrigger = true) {
  dom.modal.classList.add("hidden");
  dom.modalBody.textContent = "";
}

// ---------------------------------------------------------------------------
// Downloads
// ---------------------------------------------------------------------------
function handleDownloadClick() {
  if (!state.jobId) return;
  showToast("下载已开始，请稍候...", "success");
  window.location.href = `${API_BASE}/api/youtube/jobs/${state.jobId}/download`;
}

async function downloadSingleTranscript(video) {
  const dbId = video.id || video.video_id;
  try {
    const data = await fetchTranscript(dbId);
    const filename = `${video.video_id || "transcript"}_${video.title || "transcript"}.txt`
      .replace(/[/\\?%*:|"<>]/g, "_")
      .substring(0, 200);

    const blob = new Blob([data.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ---------------------------------------------------------------------------
// Toast notifications
// ---------------------------------------------------------------------------
let toastTimer = null;

function showToast(message, type) {
  clearToast();
  dom.toast.textContent = message;
  dom.toast.className = `toast ${type}`;
  dom.toast.classList.remove("hidden");
  toastTimer = setTimeout(() => {
    dom.toast.classList.add("hidden");
  }, 4000);
}

function clearToast() {
  if (toastTimer) clearTimeout(toastTimer);
  dom.toast.classList.add("hidden");
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------
function showSection(id) {
  document.getElementById(id).classList.remove("hidden");
}

function hideSection(id) {
  document.getElementById(id).classList.add("hidden");
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", init);
