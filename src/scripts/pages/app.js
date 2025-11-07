import routes from '../routes/routes';
import { resolveRoute } from '../routes/url-parser';

class Shell {
  #container = null;
  #toggleBtn = null;
  #navPane = null;

  constructor({ navPane, toggleBtn, content }) {
    this.#container = content;
    this.#toggleBtn = toggleBtn;
    this.#navPane = navPane;

    this.#initToggle();
  }

  #initToggle() {
    this.#toggleBtn.addEventListener('click', () => {
      this.#navPane.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navPane.contains(event.target) && !this.#toggleBtn.contains(event.target)) {
        this.#navPane.classList.remove('open');
      }

      this.#navPane.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) this.#navPane.classList.remove('open');
      });
    });
  }

  async renderPage() {
    const url = resolveRoute();
    const page = routes[url];

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#container.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      this.#container.innerHTML = await page.render();
      await page.afterRender();
    }
  }
}

export default Shell;
