# Dotgrid BG Generator

Trình tạo background lưới chấm vuông: xếp nhiều lớp hình vector lên lưới, chỉnh màu, ngưỡng, nhiễu rồi xuất PNG, SVG (kể cả SVG khổ in theo mm) hoặc CSS lặp vô hạn.

Bản React (Vite), chuyển từ một file HTML đơn ban đầu.

## Chạy tại máy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run preview
```

## Cấu trúc

```
src/
├── main.jsx                 # điểm vào React
├── App.jsx                  # state cấu hình + danh sách lớp
├── styles.css               # sidebar, subsidebar, khung xem trước
├── lib/
│   ├── color.js             # hex ↔ rgb, pha trộn, clamp
│   ├── geometry.js          # khung, lưới, vị trí lớp, đường vệt sáng
│   ├── page-size.js         # quy đổi khổ in mm ↔ khung thiết kế px
│   ├── google-fonts.js      # danh sách font và bộ nạp webfont
│   ├── text-layer.js        # dựng canvas chữ làm nguồn cho mặt nạ
│   ├── config.js            # cấu hình mặc định, khuôn lớp
│   ├── image-store.js       # kho ảnh đã nạp + cache mặt nạ lưới
│   ├── renderer.js          # duyệt chấm, vẽ canvas, sinh SVG/CSS
│   ├── exporters.js         # tải PNG/SVG, khổ in, sao chép CSS
│   ├── file-input.js        # đọc file thả vào, vá kích thước SVG
│   └── storage.js           # lưu phiên vào localStorage
└── components/              # bảng điều khiển và khung xem trước
```

## Bố cục

Ba cột: sidebar trái là cài đặt chung cho trang, subsidebar là nơi thả media và chỉnh riêng từng lớp, phần còn lại là khung xem trước nền trong suốt.

Khổ trang có hai kiểu, đổi kiểu thì kích thước đổi theo:

- **Web** — nhập thẳng pixel, xuất PNG, SVG và CSS lặp.
- **In** — nhập mm cùng DPI, khung thiết kế tự suy ra đúng tỉ lệ (thu về tối đa 2400px cho preview nhẹ), xuất SVG mang đơn vị mm hoặc PNG đúng DPI.

Lớp có hai loại: file vector hoặc ảnh thả vào, và lớp chữ tự nhập với font lấy từ Google Fonts (danh sách chọn sẵn trong `src/lib/google-fonts.js`), chỉnh được độ đậm và canh trái/giữa/phải cho nhiều dòng. Chữ được vẽ ra canvas rồi chuyển thành lưới chấm như mọi lớp khác, nên lưu phiên chỉ tốn vài dòng text thay vì ảnh.

Mỗi lớp chỉnh được màu, mức phóng to, ngưỡng, độ chuyển, độ nhiễu và tốc độ xoay. Xoay chỉ chạy ở khung xem trước; PNG, SVG và CSS xuất ra luôn giữ hình ở góc gốc.

Ảnh và cache mặt nạ nằm ngoài state React (`image-store.js`) vì là dữ liệu nhị phân nặng; state chỉ giữ cấu hình để lưu được vào localStorage.

## Deploy

Push lên `main` là GitHub Actions build và đẩy lên GitHub Pages (`.github/workflows/deploy.yml`). `vite.config.js` đặt `base: "./"` nên chạy đúng ở cả tên miền gốc lẫn đường dẫn con.
