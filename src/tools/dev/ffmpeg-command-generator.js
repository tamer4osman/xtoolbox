export const toolConfig = {
  id: 'ffmpeg-command-generator',
  name: 'FFmpeg Command Generator',
  category: 'dev',
  description: 'Build FFmpeg commands visually with input/output formats, codecs, filters, and presets.',
  icon: '🎬',
  keywords: ['ffmpeg', 'command', 'video', 'audio', 'convert', 'codec'],
  accept: '',
  maxSizeMB: 0
};

let state = {
  inputFile: '',
  outputFile: '',
  videoCodec: 'libx264',
  audioCodec: 'aac',
  bitrate: '2000k',
  resolution: '',
  frameRate: '',
  preset: 'medium',
  audioBitrate: '128k',
  sampleRate: '44100',
  channels: '2',
  format: 'mp4',
  customArgs: ''
};

const videoCodecs = [
  { value: 'libx264', label: 'H.264 (libx264)' },
  { value: 'libx265', label: 'H.265/HEVC (libx265)' },
  { value: 'libvpx', label: 'VP8 (libvpx)' },
  { value: 'libvpx-vp9', label: 'VP9 (libvpx-vp9)' },
  { value: 'libaom-av1', label: 'AV1 (libaom-av1)' },
  { value: 'copy', label: 'Copy (no re-encode)' },
  { value: '', label: 'None (audio only)' }
];

const audioCodecs = [
  { value: 'aac', label: 'AAC' },
  { value: 'libmp3lame', label: 'MP3 (libmp3lame)' },
  { value: 'libvorbis', label: 'Vorbis' },
  { value: 'libopus', label: 'Opus' },
  { value: 'copy', label: 'Copy (no re-encode)' },
  { value: '', label: 'None (video only)' }
];

const presets = [
  { value: 'ultrafast', label: 'Ultrafast' },
  { value: 'superfast', label: 'Superfast' },
  { value: 'veryfast', label: 'Veryfast' },
  { value: 'faster', label: 'Faster' },
  { value: 'fast', label: 'Fast' },
  { value: 'medium', label: 'Medium (default)' },
  { value: 'slow', label: 'Slow' },
  { value: 'slower', label: 'Slower' },
  { value: 'veryslow', label: 'Veryslow' }
];

const formats = [
  { value: 'mp4', label: 'MP4' },
  { value: 'webm', label: 'WebM' },
  { value: 'mkv', label: 'MKV' },
  { value: 'avi', label: 'AVI' },
  { value: 'mov', label: 'MOV' },
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV' },
  { value: 'ogg', label: 'OGG' }
];

const resolutions = [
  { value: '', label: 'Original' },
  { value: '1920x1080', label: '1080p (1920x1080)' },
  { value: '1280x720', label: '720p (1280x720)' },
  { value: '854x480', label: '480p (854x480)' },
  { value: '640x360', label: '360p (640x360)' },
  { value: '426x240', label: '240p (426x240)' }
];

const bitrates = [
  { value: '5000k', label: '5000k (high quality)' },
  { value: '3000k', label: '3000k' },
  { value: '2000k', label: '2000k (default)' },
  { value: '1000k', label: '1000k' },
  { value: '500k', label: '500k (low quality)' }
];

const audioBitrates = [
  { value: '320k', label: '320k' },
  { value: '192k', label: '192k' },
  { value: '128k', label: '128k (default)' },
  { value: '96k', label: '96k' },
  { value: '64k', label: '64k' }
];

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p>${toolConfig.description}</p>
      </div>

      <div class="ffmpeg-form">
        <div class="form-section">
          <h3>Input/Output</h3>
          <div class="control-row">
            <label>Input File</label>
            <input type="text" id="inputFile" placeholder="input.mp4">
          </div>
          <div class="control-row">
            <label>Output Format</label>
            <select id="format">
              ${formats.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>Video Settings</h3>
          <div class="control-row">
            <label>Video Codec</label>
            <select id="videoCodec">
              ${videoCodecs.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
            </select>
          </div>
          <div class="control-row">
            <label>Bitrate</label>
            <select id="bitrate">
              ${bitrates.map(b => `<option value="${b.value}">${b.label}</option>`).join('')}
            </select>
          </div>
          <div class="control-row">
            <label>Resolution</label>
            <select id="resolution">
              ${resolutions.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
            </select>
          </div>
          <div class="control-row">
            <label>Frame Rate</label>
            <input type="text" id="frameRate" placeholder="e.g. 30, 29.97, 60">
          </div>
          <div class="control-row">
            <label>Encoding Preset</label>
            <select id="preset">
              ${presets.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>Audio Settings</h3>
          <div class="control-row">
            <label>Audio Codec</label>
            <select id="audioCodec">
              ${audioCodecs.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
            </select>
          </div>
          <div class="control-row">
            <label>Audio Bitrate</label>
            <select id="audioBitrate">
              ${audioBitrates.map(b => `<option value="${b.value}">${b.label}</option>`).join('')}
            </select>
          </div>
          <div class="control-row">
            <label>Sample Rate</label>
            <select id="sampleRate">
              <option value="48000">48000 Hz</option>
              <option value="44100">44100 Hz</option>
              <option value="22050">22050 Hz</option>
            </select>
          </div>
          <div class="control-row">
            <label>Channels</label>
            <select id="channels">
              <option value="2">Stereo (2)</option>
              <option value="1">Mono (1)</option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>Advanced</h3>
          <div class="control-row">
            <label>Custom Arguments</label>
            <input type="text" id="customArgs" placeholder="-pix_fmt yuv420p">
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-primary" id="generateBtn">Generate Command</button>
          <button class="btn-secondary" id="copyBtn">Copy to Clipboard</button>
        </div>
      </div>

      <div class="output-section">
        <h3>Generated Command</h3>
        <div class="code-output">
          <pre id="commandOutput"><code>ffmpeg -i input.mp4 [options] output.mp4</code></pre>
        </div>
      </div>

      <div class="presets-section">
        <h3>Presets</h3>
        <div class="preset-buttons">
          <button class="btn-preset" data-preset="web-optimize">Web Optimized</button>
          <button class="btn-preset" data-preset="mobile">Mobile</button>
          <button class="btn-preset" data-preset="4k">4K Quality</button>
          <button class="btn-preset" data-preset="gif">GIF Creation</button>
          <button class="btn-preset" data-preset="extract-audio">Extract Audio</button>
        </div>
      </div>
    </div>
  `;

  bindEvents(container);
}

function bindEvents(container) {
  container.querySelectorAll('select, input').forEach(el => {
    el.addEventListener('change', () => updateState(container));
    el.addEventListener('input', () => updateState(container));
  });

  container.querySelector('#generateBtn').addEventListener('click', () => generateCommand(container));
  container.querySelector('#copyBtn').addEventListener('click', () => copyCommand(container));

  container.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', e => applyPreset(container, e.target.dataset.preset));
  });
}

function updateState(container) {
  state.inputFile = container.querySelector('#inputFile').value || 'input';
  state.format = container.querySelector('#format').value;
  state.videoCodec = container.querySelector('#videoCodec').value;
  state.bitrate = container.querySelector('#bitrate').value;
  state.resolution = container.querySelector('#resolution').value;
  state.frameRate = container.querySelector('#frameRate').value;
  state.preset = container.querySelector('#preset').value;
  state.audioCodec = container.querySelector('#audioCodec').value;
  state.audioBitrate = container.querySelector('#audioBitrate').value;
  state.sampleRate = container.querySelector('#sampleRate').value;
  state.channels = container.querySelector('#channels').value;
  state.customArgs = container.querySelector('#customArgs').value;
}

function generateCommand(container) {
  updateState(container);

  let inputExt = state.inputFile.split('.').pop() || 'mp4';
  let outputFile = state.inputFile.replace(/\.[^/.]+$/, '') + '.' + state.format;
  if (!state.inputFile) {
    inputExt = 'mp4';
    outputFile = 'output.' + state.format;
  }

  let cmd = 'ffmpeg -i ' + state.inputFile;

  if (state.videoCodec === 'copy') {
    cmd += ' -c copy';
  } else if (state.videoCodec) {
    cmd += ' -c:v ' + state.videoCodec;
    cmd += ' -b:v ' + state.bitrate;
    
    if (state.resolution) {
      cmd += ' -vf "scale=' + state.resolution.replace('x', ':') + '"';
    }
    if (state.frameRate) {
      cmd += ' -r ' + state.frameRate;
    }
    if (state.preset && state.videoCodec !== 'copy') {
      cmd += ' -preset ' + state.preset;
    }
  }

  if (state.audioCodec === 'copy') {
    cmd += ' -c:a copy';
  } else if (state.audioCodec) {
    cmd += ' -c:a ' + state.audioCodec;
    cmd += ' -b:a ' + state.audioBitrate;
    cmd += ' -ar ' + state.sampleRate;
    cmd += ' -ac ' + state.channels;
  }

  if (state.customArgs) {
    cmd += ' ' + state.customArgs;
  }

  cmd += ' ' + outputFile;

  container.querySelector('#commandOutput code').textContent = cmd;
}

function copyCommand(container) {
  const cmd = container.querySelector('#commandOutput code').textContent;
  navigator.clipboard.writeText(cmd);
  const btn = container.querySelector('#copyBtn');
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy to Clipboard', 2000);
}

function applyPreset(container, preset) {
  const selects = {
    format: container.querySelector('#format'),
    videoCodec: container.querySelector('#videoCodec'),
    bitrate: container.querySelector('#bitrate'),
    resolution: container.querySelector('#resolution'),
    frameRate: container.querySelector('#frameRate'),
    preset: container.querySelector('#preset'),
    audioCodec: container.querySelector('#audioCodec'),
    audioBitrate: container.querySelector('#audioBitrate'),
    customArgs: container.querySelector('#customArgs')
  };

  const presets = {
    'web-optimize': {
      format: 'mp4', videoCodec: 'libx264', bitrate: '2000k', resolution: '1280x720', 
      frameRate: '30', preset: 'medium', audioCodec: 'aac', audioBitrate: '128k', customArgs: '-movflags +faststart'
    },
    'mobile': {
      format: 'mp4', videoCodec: 'libx264', bitrate: '1000k', resolution: '854x480',
      frameRate: '30', preset: 'fast', audioCodec: 'aac', audioBitrate: '96k', customArgs: ''
    },
    '4k': {
      format: 'mp4', videoCodec: 'libx265', bitrate: '5000k', resolution: '1920x1080',
      frameRate: '30', preset: 'slow', audioCodec: 'aac', audioBitrate: '192k', customArgs: ''
    },
    'gif': {
      format: 'mp4', videoCodec: 'libx264', bitrate: '500k', resolution: '320x240',
      frameRate: '15', preset: 'ultrafast', audioCodec: '', audioBitrate: '', customArgs: '-filter_complex "[0:v] fps=15,scale=320:-1 [s]; [s] palettegen" -y palette.png'
    },
    'extract-audio': {
      format: 'mp3', videoCodec: '', bitrate: '', resolution: '',
      frameRate: '', preset: '', audioCodec: 'libmp3lame', audioBitrate: '192k', customArgs: '-vn'
    }
  };

  const p = presets[preset];
  if (!p) return;

  if (p.format) selects.format.value = p.format;
  if (p.videoCodec) selects.videoCodec.value = p.videoCodec;
  if (p.bitrate) selects.bitrate.value = p.bitrate;
  if (p.resolution) selects.resolution.value = p.resolution;
  if (p.frameRate) selects.frameRate.value = p.frameRate;
  if (p.preset) selects.preset.value = p.preset;
  if (p.audioCodec) selects.audioCodec.value = p.audioCodec;
  if (p.audioBitrate) selects.audioBitrate.value = p.audioBitrate;
  if (p.customArgs) selects.customArgs.value = p.customArgs;

  updateState(container);
  generateCommand(container);
}