module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'vercel dev',
      startServerReadyPattern: 'Ready - started server',
      startServerReadyTimeout: 30000,
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': 'off',
        'categories:accessibility': 'off',
        'categories:best-practices': 'off',
        'categories:seo': 'off',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lhci-reports',
    },
  },
};