/** Danh sách font Google chọn sẵn và bộ nạp font trước khi vẽ chữ lên canvas. */

export const GOOGLE_FONTS = [
  { family: "Be Vietnam Pro", weights: [400, 700, 900] },
  { family: "Inter", weights: [400, 700, 900] },
  { family: "Roboto", weights: [400, 700, 900] },
  { family: "Open Sans", weights: [400, 700, 800] },
  { family: "Montserrat", weights: [400, 700, 900] },
  { family: "Poppins", weights: [400, 700, 900] },
  { family: "Manrope", weights: [400, 700, 800] },
  { family: "Space Grotesk", weights: [400, 700] },
  { family: "Rubik", weights: [400, 700, 900] },
  { family: "Barlow Condensed", weights: [400, 700, 900] },
  { family: "Oswald", weights: [400, 700] },
  { family: "Anton", weights: [400] },
  { family: "Bebas Neue", weights: [400] },
  { family: "Archivo Black", weights: [400] },
  { family: "Teko", weights: [400, 700] },
  { family: "Playfair Display", weights: [400, 700, 900] },
  { family: "Lora", weights: [400, 700] },
  { family: "Merriweather", weights: [400, 700, 900] },
  { family: "Righteous", weights: [400] },
  { family: "Lobster", weights: [400] },
  { family: "Pacifico", weights: [400] },
  { family: "Bungee", weights: [400] }
];

export const DEFAULT_FONT = GOOGLE_FONTS[0];

export function weightsOf(family) {
  const found = GOOGLE_FONTS.find((f) => f.family === family);
  return found ? found.weights : [400];
}

const requested = new Set();

function addStylesheet(family, weight) {
  const key = family + ":" + weight;
  if (requested.has(key)) return;
  requested.add(key);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=" +
    encodeURIComponent(family).replace(/%20/g, "+") +
    ":wght@" + weight + "&display=swap";
  document.head.appendChild(link);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Nạp một kiểu chữ và chờ tới khi trình duyệt thật sự dùng được nó.
 * Chờ vì canvas vẽ bằng font dự phòng nếu file font chưa về kịp.
 */
export async function loadFont(family, weight, sizePx) {
  addStylesheet(family, weight);
  const spec = weight + " " + sizePx + 'px "' + family + '"';
  for (let i = 0; i < 12; i++) {
    try {
      await document.fonts.load(spec);
      if (document.fonts.check(spec)) return true;
    } catch (e) {
      /* font chưa đăng ký thì thử lại */
    }
    await sleep(100);
  }
  return false;
}
