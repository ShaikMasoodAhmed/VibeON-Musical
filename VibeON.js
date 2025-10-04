console.log("Writing Javascript")

async function getSongs(folder) {

  let links = await fetch(`http://127.0.0.1:3000/Songs/${folder}/?t=${Date.now()}`);
  let text = await links.text();
  let songDiv = document.createElement("div");
  songDiv.innerHTML = text;

  let anchorTags = songDiv.getElementsByTagName("a");
  let songsList = [];

  for (let index = 0; index < anchorTags.length; index++) {
    const element = anchorTags[index];
    if (element.href.endsWith(".mp3")) {
      songsList.push(element.href);
    }
  }
  return songsList;
}

function formatTime(timeInSeconds) {
  // Make sure we use whole seconds
  const totalSeconds = Math.floor(Number(timeInSeconds));

  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


async function playMusic(trackBtn) {
  // Reset all play icons in the playlist
  document.querySelectorAll(".libPlayList li .libPlayImg")
    .forEach(img => img.src = "VibeOn-SVG/play.svg");

  // Extract current song title
  let title = audio.src.replace(`http://127.0.0.1:3000/%5CSongs%5C${Album}%5C`, "")
                       .replaceAll("%20", " ");
  console.log("Now playing:", title);

  document.querySelector(".songTitle").innerHTML = title;
  document.querySelector(".songDuration").innerHTML = "";

  // Highlight currently playing song in playlist
  document.querySelectorAll(".libPlayList li").forEach(li => {
    let img = li.querySelector(".libPlayImg");
    img.src = (li.querySelector(".libsongTitle").innerHTML === title) 
                ? "VibeOn-SVG/pause.svg" 
                : "VibeOn-SVG/play.svg";
  });

  // Album → cardPlay element mapping
  const albumToElement = {
    "Telugu_Trending": teluguSongsPlay,
    "Tamil_Trending": tamilSongsPlay,
    "Hindi_Trending": HindiSongsPlay,
    "English_Trending": HollywoodSongsPlay,
    "Ani_Vibes": aniVibesPlay,
    "Telugu_Melody": teluguMelodyPlay,
    "Hindi_Melody": latestHindiPlay,
    "English_Melody": englishMelodyPlay,
    "Happy_Vibes_Telugu": HappyTeluguPlay,
    "Tamil_Vibes": tamilVibesPlay,
    "Hindi_Vibes": HindiVibesPlay,
    "English_Vibes": EnglishVibesPlay,
  };

  // Helper → update card icon
  const updateCardIcon = (isPlaying) => {
    let el = albumToElement[Album];
    if (!el) return;
    el.src = isPlaying ? "VibeOn-SVG/cardPause.svg" : "VibeOn-SVG/cardPlay.svg";
  };

  // Main logic
  if (trackBtn.src === toggleBtn.src) {
    if (audio.paused) {
      await audio.play().then(() => {
        toggleBtn.src = "VibeOn-SVG/pause.svg";
        if (audio.src === songsList[0]) updateCardIcon(true);
        console.log("Playing...");
      }).catch(err => console.error("Playing failed:", err));
    } else {
      audio.pause();
      toggleBtn.src = "VibeOn-SVG/play.svg";
      if (audio.src === songsList[0]) updateCardIcon(false);
      console.log("Audio paused!");
    }
  } else {
    if (audio.paused) {
      await audio.play().then(() => {
        trackBtn.src = "VibeOn-SVG/cardPause.svg";
        toggleBtn.src = "VibeOn-SVG/pause.svg";
        console.log("Playing...");
      }).catch(err => console.error("Playing failed:", err));
    } else {
      audio.pause();
      trackBtn.src = "VibeOn-SVG/cardPlay.svg";
      toggleBtn.src = "VibeOn-SVG/play.svg";
      console.log("Audio paused!");
    }
  }
}


let audio = new Audio();
let track;
let songsList;
let Album;

audio.addEventListener("timeupdate", () => {
  document.querySelector(".songDuration").innerHTML = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  document.querySelector(".circle").style.left = (audio.currentTime / audio.duration) * 100 + "%";
  document.querySelector(".skip").style.width = (audio.currentTime / audio.duration) * 100 + "%";
  document.querySelector(".skip").style.backgroundColor = "#f26aaaff";
  if (audio.currentTime === audio.duration) {

    toggleBtn.src = "VibeOn-SVG/play.svg";

    setTimeout(() => {
      next();
    }, 2000);
  }

})

document.querySelector(".seekBar").addEventListener("click", e => {

  let skip = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = skip + "%";
  document.querySelector(".skip").style.width = skip + "%";
  document.querySelector(".skip").style.backgroundColor = "#f26aaaff";
  audio.currentTime = (audio.duration * skip) / 100;
})

async function showAlbum() {
  console.log(Album)
  let albumSongsList = await getSongs(Album);
  let libPlayList = document.querySelector(".libPlayList").getElementsByTagName("ul")[0];
  libPlayList.style.display = "block";
  libPlayList.innerHTML = "";
  for (const song of albumSongsList) {
    libtitle = song.replace("http://127.0.0.1:3000/%5CSongs%5C" + `${Album}` + "%5C", "");
    console.log(libtitle)
    libPlayList.innerHTML = libPlayList.innerHTML + `<li>     
                          <div class="libinfo">
                                <img  src="VibeOn-SVG/libPlay.svg" alt="">
                                <div class="songdet">
                                    <div class="libsongTitle">${libtitle.replaceAll("%20", " ")}</div>
                                    <div>artist</div>
                                </div>
                            </div>
                            <div class="playNow">
                                <span>Play now</span>
                                <img class="libPlayImg" src="VibeOn-SVG/play.svg" alt="">
                            </div> </li>`;
  }
  Array.from(document.querySelector(".libPlayList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", () => {
      document.querySelector(".songTitle").innerHTML = e.querySelector(".libsongTitle").innerHTML;

      document.querySelectorAll(".cardPlayBtn").forEach(img => {
        img.src = "VibeOn-SVG/cardPlay.svg";
      });

      track = "http://127.0.0.1:3000/%5CSongs%5C" + `${Album}` + "%5C" +
        e.querySelector(".libsongTitle").innerHTML.replaceAll(" ", "%20");

    

      if (audio.src.endsWith(track)) {
        if (audio.paused) {
          audio.play()
            .then(() => {
              toggleBtn.src = "VibeOn-SVG/pause.svg";
              e.querySelector(".libPlayImg").src = "VibeOn-SVG/pause.svg";
              console.log("Playing...");
            })
            .catch(err => console.error("Playing failed:", err));
        } else {
          audio.pause();
          toggleBtn.src = "VibeOn-SVG/play.svg";
          e.querySelector(".libPlayImg").src = "VibeOn-SVG/play.svg";
          console.log("Audio Paused.!");
        }
      } else {
        audio.src = track;

        document.querySelectorAll(".libPlayList li .libPlayImg").forEach(img => {
          img.src = "VibeOn-SVG/play.svg";
        });

        audio.play()
          .then(() => {
            toggleBtn.src = "VibeOn-SVG/pause.svg";
            e.querySelector(".libPlayImg").src = "VibeOn-SVG/pause.svg";
            console.log("Playing...");
          })
          .catch(err => console.error("Playing failed:", err));
      }
    });
  });
  return albumSongsList;
}

// document.querySelectorAll("[data-album]").forEach(btn => {
//   btn.addEventListener("click", () => {
//     sessionStorage.setItem("playAlbum", btn.dataset.album);
//     location.reload();  // hard refresh
//   });
// });

// window.addEventListener("load", () => {
//   const albumToPlay = sessionStorage.getItem("playAlbum");
//   if (albumToPlay) {
//     Album = albumToPlay;
//     playSongs();
//     sessionStorage.removeItem("playAlbum");
//   }
// });


// Click handler without reload
document.querySelectorAll("[data-album]").forEach(btn => {
  btn.addEventListener("click", () => {
    const albumToPlay = btn.dataset.album;

    if (Album !== albumToPlay) {       // only change if different
      Album = albumToPlay;
      playSongs();                     // fetch + render new songs
    } else {
      // optional toggle (hide/show playlist on second click)
      let libPlayList = document.querySelector(".libPlayList ul");
      libPlayList.style.display =
        libPlayList.style.display === "none" ? "block" : "none";
    }
  });
});

async function playSongs() {

  songsList = await showAlbum();
  console.log(songsList);

  let toggleBtn = document.getElementById("toggleBtn");
  audio.src = songsList[0];
  toggleBtn.addEventListener("click", () => {
    playMusic(toggleBtn);
  })

const playButtons = {
  Telugu_Trending: document.getElementById("teluguSongsPlay"),
  Tamil_Trending: document.getElementById("tamilSongsPlay"),
  Hindi_Trending: document.getElementById("HindiSongsPlay"),
  English_Trending: document.getElementById("HollywoodSongsPlay"),
  Ani_Vibes: document.getElementById("aniVibesPlay"),
  Telugu_Melody: document.getElementById("teluguMelodyPlay"),
  Hindi_Melody: document.getElementById("latestHindiPlay"),
  English_Melody: document.getElementById("englishMelodyPlay"),
  Happy_Vibes_Telugu: document.getElementById("HappyTeluguPlay"),
  Tamil_Vibes: document.getElementById("tamilVibesPlay"),
  Hindi_Vibes: document.getElementById("HindiVibesPlay"),
  English_Vibes: document.getElementById("EnglishVibesPlay"),
};

function resetAllButtons() {
  Object.values(playButtons).forEach(btn => {
    btn.src = "VibeOn-SVG/cardPlay.svg";
  });
}

function setupPlayHandler(albumName, button) {
  button.addEventListener("click", () => {
    if (Album === albumName) {
      resetAllButtons();

      if (audio.src !== songsList[0] && audio.paused) {
        audio.src = songsList[0];
      }

      playMusic(button);
    }
  });
}

for (const [albumName, button] of Object.entries(playButtons)) {
  setupPlayHandler(albumName, button);
}


}

document.querySelector(".humImg").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0%";
})
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-140%";
})

// document.querySelector(".searchIcon").addEventListener("click",()=>{
//    document.querySelector(".searchInput").style.display="block";
// })

function playMusicByIndex(index) {
  audio.src = songsList[index];
  title = (audio.src.replace("http://127.0.0.1:3000/%5CSongs%5C" + `${Album}` + "%5C", ""));
  title = title.replaceAll("%20", " ");

  document.querySelector(".songTitle").innerHTML = title;
  document.querySelector(".songDuration").innerHTML = "00:00 / 00:00";

  if (Album == "Telugu_Trending") {
    playMusic(teluguSongsPlay);
  } else if (Album == "Hindi_Trending") {
    playMusic(HindiSongsPlay);
  }
  else if (Album == "Tamil_Trending") {
    playMusic(tamilSongsPlay);
  }
  else if (Album == "English_Trending") {
    playMusic(HollywoodSongsPlay);
  }
  else if (Album == "Ani_Vibes") {
    playMusic(aniVibesPlay);
  }
  else if (Album == "Telugu_Melody") {
    playMusic(teluguMelodyPlay);
  }
  else if (Album == "Hindi_Melody") {
    playMusic(latestHindiPlay);
  }
  else if (Album == "English_Melody") {
    playMusic(englishMelodyPlay);
  }
  else if (Album == "Happy_Vibes_Telugu") {
    playMusic(HappyTeluguPlay);
  }
  else if (Album == "Tamil_Vibes") {
    playMusic(tamilVibesPlay);
  }
  else if (Album == "Hindi_Vibes") {
    playMusic(HindiVibesPlay);
  }
  else {
    playMusic(EnglishVibesPlay);
  }
}

document.querySelector("#next").addEventListener("click", () => {
  next();
})
function next() {

  console.log("next Clicked");
  let index = songsList.indexOf(audio.src);
  console.log(index);


  if (index + 1 < songsList.length) {
    playMusicByIndex(index + 1);
  }
}
document.querySelector("#prev").addEventListener("click", () => {
  console.log("Prev Clicked");
  let index = songsList.indexOf(audio.src);
  console.log(index);

  if (index - 1 >= 0) {
    playMusicByIndex(index - 1);
  }
})

document.querySelector("#volRange").addEventListener("change", (e) => {
  let volImg = document.querySelector(".volImg");
  audio.volume = parseInt(e.target.value) / 100;
  console.log("Volume:" + parseInt(e.target.value));
  volImg.src = "VibeOn-SVG/volume.svg";
  if (audio.volume == 0) {
    volImg.src = "VibeOn-SVG/mute.svg";
  }
  else if (audio.volume < 0.5) {
    volImg.src = "VibeOn-SVG/midVol.svg";
  }
})