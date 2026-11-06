// VIRTUAL IPHONE SETTINGS

const PASSCODE = "0922";

const lockScreen = document.getElementById("lockScreen");
const passcodeScreen = document.getElementById("passcodeScreen");
const homeScreen = document.getElementById("homeScreen");
const appScreen = document.getElementById("appScreen");

let enteredCode = "";

let notes = JSON.parse(localStorage.getItem("myNotes")) || [
  {
    id: 1,
    title: "hello, migo",
    body: "",
    date: Date.now()
  }
];

let currentSong = 0;
let isPlaying = false;

const songs = [
  ["Mahika", "Adie & Janine Berdin"],
  ["An Art Gallery Could Never Be as Unique as You", "mrld"],
  ["U + Me = <3", "Olivia Rodrigo"],
  ["Afterglow", "Taylor Swift"],
  ["Tsunami", "NIKI"],
  ["Glue Song", "beabadoobee"],
  ["Ikot", "Over October"],
  ["Pasilyo", "Sunkissed Lola"],
  ["Take A Chance With Me", "NIKI"],
  ["Daylight", "Taylor Swift"],
  ["It's Not Living (If It's Not With You)", "The 1975"]
];

// CLOCK

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  document.getElementById("lockTime").textContent = time;
  document.getElementById("homeTime").textContent = time;

  document.getElementById("lockDate").textContent =
    now.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
}

updateClock();
setInterval(updateClock, 1000);

// SCREEN NAVIGATION

function showOnly(screen) {
  [lockScreen, passcodeScreen, homeScreen, appScreen]
    .forEach(element => element.classList.add("hidden"));

  screen.classList.remove("hidden");
}

function showPasscode() {
  enteredCode = "";
  updateDots();

  document.getElementById("errorMessage").textContent = "";

  showOnly(passcodeScreen);
}

function showLock() {
  showOnly(lockScreen);
}

function unlockPhone() {
  showOnly(homeScreen);

  document.querySelector(".lock-wallpaper").style.opacity = "0";
  document.querySelector(".home-wallpaper").style.opacity = "1";
}

function goHome() {
  showOnly(homeScreen);
}

// PASSCODE

function updateDots() {
  const dots = document.querySelectorAll("#dots i");

  dots.forEach((dot, index) => {
    dot.classList.toggle("filled", index < enteredCode.length);
  });
}

function pressKey(number) {
  if (enteredCode.length >= 4) return;

  enteredCode += number;
  updateDots();

  if (enteredCode.length === 4) {
    if (enteredCode === PASSCODE) {
      setTimeout(unlockPhone, 200);
    } else {
      document.getElementById("errorMessage").textContent =
        "Incorrect passcode. Try again.";

      setTimeout(() => {
        enteredCode = "";
        updateDots();
      }, 700);
    }
  }
}

function deleteKey() {
  enteredCode = enteredCode.slice(0, -1);
  updateDots();
}

// APPLICATION NAVIGATION

function openApp(app) {
  const titles = {
    notes: "Notes",
    photos: "Photos",
    spotify: "Spotify",
    instagram: "Instagram",
    phone: "Phone",
    messages: "Messages",
    netflix: "Netflix",
    letterboxd: "Letterboxd",
    codm: "Call of Duty",
    mlbb: "Mobile Legends",
    roblox: "Roblox",
    calendar: "Calendar",
    clock: "Clock",
    camera: "Camera"
  };

  document.getElementById("appTitle").textContent =
    titles[app] || "App";

  const content = document.getElementById("appContent");

  content.innerHTML = "";

  if (app === "notes") {
    renderNotes(content);
  }

  else if (app === "photos") {
    renderPhotos(content);
  }

  else if (app === "spotify") {
    renderSpotify(content);
  }

  else {
    renderPlaceholder(content, app, titles[app] || "App");
  }

  showOnly(appScreen);
}

// NOTES APP

function saveNotes() {
  localStorage.setItem("myNotes", JSON.stringify(notes));
}

function renderNotes(root) {
  root.innerHTML = `
    <div class="note-toolbar">
      <span>On My iPhone</span>
      <button class="primary-button" id="newNote">
        + New Note
      </button>
    </div>

    <div id="noteList"></div>
  `;

  const list = document.getElementById("noteList");

  function refreshNotes() {
    list.innerHTML = "";

    notes
      .sort((a, b) => b.date - a.date)
      .forEach(note => {
        const row = document.createElement("button");

        row.className = "note-row";

        const title = document.createElement("strong");
        title.textContent = note.title || "New Note";

        const preview = document.createElement("small");
        preview.textContent = note.body || "No additional text";

        const date = document.createElement("small");
        date.textContent = new Date(note.date).toLocaleDateString();

        row.append(title, preview, date);

        row.onclick = () => editNote(note.id);

        list.appendChild(row);
      });
  }

  document.getElementById("newNote").onclick = () => {
    const note = {
      id: Date.now(),
      title: "",
      body: "",
      date: Date.now()
    };

    notes.push(note);
    saveNotes();
    editNote(note.id);
  };

  refreshNotes();
}

function editNote(id) {
  const note = notes.find(item => item.id === id);

  if (!note) return;

  const root = document.getElementById("appContent");

  root.innerHTML = `
    <div class="note-toolbar">
      <button id="backNotes">‹ Notes</button>
      <button id="deleteNote" style="color:red;background:none">
        Delete
      </button>
    </div>

    <input
      class="note-title"
      id="noteTitle"
      placeholder="Title"
    >

    <textarea
      class="note-body"
      id="noteBody"
      placeholder="Start writing..."
    ></textarea>
  `;

  const title = document.getElementById("noteTitle");
  const body = document.getElementById("noteBody");

  title.value = note.title;
  body.value = note.body;

  function updateNote() {
    note.title = title.value;
    note.body = body.value;
    note.date = Date.now();

    saveNotes();
  }

  title.addEventListener("input", updateNote);
  body.addEventListener("input", updateNote);

  document.getElementById("backNotes").onclick = () => {
    updateNote();
    openApp("notes");
  };

  document.getElementById("deleteNote").onclick = () => {
    notes = notes.filter(item => item.id !== id);
    saveNotes();
    openApp("notes");
  };
}

// PHOTOS APP

let photoDatabase = null;

function openPhotoDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("MyVirtualIphonePhotos", 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore("photos", {
        keyPath: "id",
        autoIncrement: true
      });
    };

    request.onsuccess = () => {
      photoDatabase = request.result;
      resolve(photoDatabase);
    };

    request.onerror = () => reject(request.error);
  });
}

async function renderPhotos(root) {
  root.innerHTML = `
    <div class="photo-toolbar">
      <strong>Library</strong>

      <label class="primary-button" for="photoPicker">
        + Add Photos
      </label>

      <input
        type="file"
        id="photoPicker"
        accept="image/*"
        multiple
        hidden
      >
    </div>

    <div class="photo-grid" id="photoGrid"></div>
  `;

  const grid = document.getElementById("photoGrid");

  try {
    const db = photoDatabase || await openPhotoDatabase();

    const transaction = db.transaction("photos", "readonly");

    const request = transaction.objectStore("photos").getAll();

    request.onsuccess = () => {
      const photos = request.result;

      if (photos.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            Your photos will appear here.
            <br><br>
            Tap Add Photos to import pictures.
          </div>
        `;
        return;
      }

      photos.forEach(photo => {
        const image = document.createElement("img");

        image.src = URL.createObjectURL(photo.blob);
        image.alt = "My photo";

        grid.appendChild(image);
      });
    };

  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state">
        Photo storage is unavailable in this browser.
      </div>
    `;
  }

  document.getElementById("photoPicker").onchange = async event => {
    const db = photoDatabase || await openPhotoDatabase();

    const transaction = db.transaction("photos", "readwrite");

    [...event.target.files].forEach(file => {
      if (file.type.startsWith("image/")) {
        transaction.objectStore("photos").add({
          blob: file,
          name: file.name,
          date: Date.now()
        });
      }
    });

    transaction.oncomplete = () => renderPhotos(root);
  };
}

// SPOTIFY APP

function renderSpotify(root) {
  root.innerHTML = `
    <div class="spotify-screen">

      <div class="spotify-top">
        <div class="spotify-cover">🌙</div>

        <div class="spotify-meta">
          <small>PLAYLIST</small>
          <h2>🌙</h2>
          <small>11 songs · Made for you</small>
        </div>
      </div>

      <p style="color:#c8b9dc;font-size:12px;margin-top:25px">
        A little collection of songs.
      </p>

      <div id="songList"></div>

      <div class="playbar">
        <span id="nowPlaying">Mahika</span>

        <button id="previousSong">◀</button>
        <button id="playButton">▶</button>
        <button id="nextSong">▶|</button>
      </div>

    </div>
  `;

  const list = document.getElementById("songList");

  songs.forEach((song, index) => {
    const row = document.createElement("div");

    row.className = "song-row";

    const number = document.createElement("span");
    number.textContent = index + 1;

    const button = document.createElement("button");

    const title = document.createElement("strong");
    title.textContent = song[0];

    const artist = document.createElement("small");
    artist.textContent = song[1];

    button.append(title, artist);

    button.onclick = () => {
      currentSong = index;
      isPlaying = true;
      updatePlayer();
    };

    row.append(number, button);
    list.appendChild(row);
  });

  document.getElementById("playButton").onclick = () => {
    isPlaying = !isPlaying;
    updatePlayer();
  };

  document.getElementById("nextSong").onclick = () => {
    currentSong = (currentSong + 1) % songs.length;
    isPlaying = true;
    updatePlayer();
  };

  document.getElementById("previousSong").onclick = () => {
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    isPlaying = true;
    updatePlayer();
  };

  function updatePlayer() {
    document.getElementById("nowPlaying").textContent =
      songs[currentSong][0];

    document.getElementById("playButton").textContent =
      isPlaying ? "Ⅱ" : "▶";
  }
}

// OTHER APPLICATIONS

function renderPlaceholder(root, app, title) {
  const icons = {
    instagram: "◎",
    phone: "☎",
    messages: "●",
    netflix: "N",
    letterboxd: "▣",
    codm: "COD",
    mlbb: "ML",
    roblox: "◇",
    calendar: "6",
    clock: "◷",
    camera: "◉"
  };

  root.innerHTML = `
    <div class="placeholder">
      <div class="big-icon">${icons[app] || "✦"}</div>
      <h2>${title}</h2>
      <p>
        Welcome to your virtual ${title}.
        More features coming soon.
      </p>
    </div>
  `;
}
