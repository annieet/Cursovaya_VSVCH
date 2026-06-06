export const PAGINATION_SX = {
  '& .MuiPaginationItem-root': {
    minWidth: 32,
    height: 32,
    borderRadius: 1,
    border: '1px solid rgba(5,5,5,0.14)',
    color: 'text.secondary',
    fontWeight: 600,
  },
  '& .MuiPaginationItem-root:hover': {
    bgcolor: 'rgba(5,5,5,0.04)',
  },
  '& .MuiPaginationItem-root.Mui-selected': {
    bgcolor: 'rgba(193,18,31,0.1)',
    borderColor: 'rgba(193,18,31,0.45)',
    color: 'secondary.main',
  },
  '& .MuiPaginationItem-root.Mui-selected:hover': {
    bgcolor: 'rgba(193,18,31,0.16)',
  },
};

export const PAGINATION_PROPS = {
  color: 'secondary',
  shape: 'rounded',
  size: 'small',
  siblingCount: 1,
  boundaryCount: 1,
};
