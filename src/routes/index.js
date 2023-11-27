import { route } from './utils';
import pingRoutes from './pingRoutes';
import adminRoutes from './adminRoutes';
import securityRoutes from './securityRoutes';
// guaranteed to get dependencies
export default () => {
  pingRoutes();
  adminRoutes();
  securityRoutes();
  return route;
};