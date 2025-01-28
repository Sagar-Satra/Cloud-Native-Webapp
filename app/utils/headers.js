
export const setNoCacheHeaders = (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
       .set('Pragma', 'no-cache');
};
