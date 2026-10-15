# HustleMate AI 💼

**A browser-based AI writing studio for freelancers, online sellers, and small businesses.**

HustleMate helps people create product descriptions, social captions, client proposals, and client emails. It uses HTML, CSS, JavaScript, Hugging Face Transformers.js, and the open-weight `onnx-community/SmolLM2-360M-Instruct` model.

## Why this project?

Small business owners often spend time writing repetitive marketing and client content. HustleMate turns a few details into a useful first draft, which users can edit, copy, download, or save in their browser.

## Features

- Four focused writing tools
- Tone and audience options
- Open-weight AI text generation in the browser
- No paid model API key required
- Copy and download generated drafts
- Save drafts locally with browser `localStorage`
- Responsive layout for desktop and mobile
- User prompts are passed to the in-browser model, not to a custom application server

## Technology

- HTML5
- CSS3
- JavaScript ES modules
- [Transformers.js](https://github.com/huggingface/transformers.js/)
- [SmolLM2 model family](https://github.com/huggingface/smollm)

## Run locally

Because the app uses JavaScript modules, open it through a local static server rather than directly with `file://`.

### Option 1: VS Code Live Server

1. Download or clone this repository.
2. Open the folder in VS Code.
3. Install the Live Server extension if needed.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Click a writing tool, enter details, and select **Generate with open AI**.

### Option 2: Python static server

If Python is installed, open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository and upload `index.html`, `style.css`, `script.js`, and `README.md`.
2. Open **Settings → Pages** in the repository.
3. Choose deployment from the `main` branch and the root folder.
4. Save and wait for GitHub Pages to publish the site.

GitHub Pages serves the front end. On the first run, the app needs an internet connection to fetch the Transformers.js library and model files. The browser may cache model files for later use, but fully offline operation is not guaranteed by this starter version.

## Open innovation: why it matters

HustleMate uses an open-weight model through an open-source JavaScript inference library. This offers several benefits:

- **More control:** the model can be replaced or adapted as the project grows.
- **Lower running cost:** there is no per-request paid AI API in this prototype.
- **Privacy-conscious design:** prompts are processed in the browser rather than sent to a HustleMate backend or commercial text-generation API.
- **Accessible experimentation:** contributors can inspect the code and improve prompts, UI, or model selection.

The browser still downloads the model from its hosting source on first use. Review the selected model's license and hosting setup before using it commercially. Open weights and open-source code do not automatically mean every model has identical licensing terms.

## Business model ideas

- Free tier: a limited number of drafts or basic tools.
- Paid tier: saved brand profiles, reusable templates, export formats, and team workspaces.
- Custom setup: tailor the tool for a niche such as local boutiques, bakers, tutors, or freelance designers.

These are future product ideas, not payment features implemented in the starter app.

## Important limitations

- AI output can be incorrect or repetitive. Review and edit before publishing or sending.
- Small models may produce short or imperfect results, especially for complex proposals.
- Performance depends on the device and browser. Initial model download may take time and use significant memory.
- This demo does not include accounts, billing, a backend, analytics, or server-side storage.

## Suggested next steps

1. Ask one freelancer or small seller to test the app.
2. Observe which tool they use and what they edit.
3. Improve prompts based on their feedback.
4. Add a brand profile and export-to-PDF feature.
5. Record real user feedback in your challenge submission—do not claim a paying user unless someone actually pays.

## License

The starter code can be released under the MIT License. Check and follow the separate licenses and terms of the Transformers.js library and selected model.
