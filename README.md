# Resume Micro App

A Bauhaus-styled resume builder for WeChat mini-programs, aimed at graduates applying for campus recruitment. Users enter their experience, an AI step rewrites plain descriptions into stronger bullet points, and the result can be previewed and exported. Work in progress.

## Stack
- Taro 4 + React 18 + TypeScript, Sass
- Zustand for state
- WeChat Cloud Development (cloud functions, database, storage)
- DeepSeek API, called only from a cloud function so the key is never exposed

## Structure
| Path | Contents |
|---|---|
| `src/pages/` | `home`, `template`, `editor`, `preview`, `profile` |
| `src/store/` | Zustand stores |
| `src/utils/`, `src/types/` | Helpers and resume data types |
| `cloudfunctions/aiPolish` | AI polishing of experience, project and summary text |
| `cloudfunctions/exportPdf` | PDF export |
| `config/` | Taro build config |

## Run
```bash
npm install
npm run dev:weapp   # WeChat mini-program; open the output in WeChat DevTools
npm run dev:h5      # browser preview
```
Set `appid` in `project.config.json` (it is the `touristappid` placeholder) and add a `DEEPSEEK_API_KEY` environment variable to the `aiPolish` cloud function before deploying it.
