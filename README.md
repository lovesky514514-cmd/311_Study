# 311背书助手 v2.3 GitHub-Lite

专门用于 GitHub Pages 部署。功能和 v2.3 Source-First 一致，但把原册扫描图去重并重压缩。

- 原版本 1052 张扫描文件，存在重复。
- Lite 版只保留 742 张唯一的 doc+page 图片。
- 扫描图从约 87.2 MB 压缩为 29.1 MB。
- 图片宽度约 520px、灰度 WebP、质量30；仍可作为 OCR 错字时的原册核对图。
- question / answer / material / candidate 共用同一张扫描图，不再重复保存。
- questions.json 中全部图片引用已重新校验。
- JavaScript: PASS。

GitHub Pages 不要求整个仓库小于25MB；关键是单个文件不要超过 GitHub 的单文件限制。Lite 包解压后都是小文件，适合部署。
