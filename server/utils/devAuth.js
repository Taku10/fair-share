let hasWarnedNonLocalBypass = false;

function isLocalRuntime() {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  return nodeEnv === 'development' || nodeEnv === 'test';
}

function isDevAuthBypassEnabled() {
  const allowDevAuth = process.env.ALLOW_DEV_AUTH === 'true';
  const enabled = allowDevAuth && isLocalRuntime();

  if (allowDevAuth && !enabled && !hasWarnedNonLocalBypass) {
    hasWarnedNonLocalBypass = true;
    console.warn('ALLOW_DEV_AUTH=true ignored because NODE_ENV is not local/test');
  }

  return enabled;
}

module.exports = { isDevAuthBypassEnabled };
