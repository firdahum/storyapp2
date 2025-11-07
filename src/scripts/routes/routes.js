import DashboardPage from '../pages/dashboard.js';
import InfoPage from '../pages/about.js';
import GeoPage from '../pages/geomap.js';
import ComposePage from '../pages/uploadstory.js';
import SignInPage from '../pages/login.js';
import SignUpPage from '../pages/register.js';
import FavoriteStoryPage from '../pages/favorite-story.js';

const routes = {
  '/': new DashboardPage(),
  '/dashboard': new DashboardPage(),
  '/about': new InfoPage(),
  '/geomap': new GeoPage(),
  '/uploadstory': new ComposePage(),
  '/login': new SignInPage(),
  '/register': new SignUpPage(),
  '/favorites': new FavoriteStoryPage(),
};

export default routes;
