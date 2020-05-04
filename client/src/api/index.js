/**
 * api接口的统一出口
 */

import banner from './bannersApi';
import auth from './authApi';
import menu from './menuApi';
import post from './postApi';

// 导出接口
export default {
    banner, auth, menu, post
};