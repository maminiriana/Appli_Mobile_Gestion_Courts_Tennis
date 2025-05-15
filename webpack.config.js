const { withExpoWebpack } = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await withExpoWebpack(env, argv);

  // Activer la réécriture des routes pour expo-router
  config.devServer = {
    ...config.devServer,
    historyApiFallback: true, // pour que le rechargement d'une page interne fonctionne
  };

  return config;
};
