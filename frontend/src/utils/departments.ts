export const getDeptName = (dept: string) => {
  switch (dept) {
    case 'mining': return 'Ingénierie Minière';
    case 'geosciences': return 'Géosciences';
    case 'topography': return 'Topographie';
    default: return 'Général';
  }
};
