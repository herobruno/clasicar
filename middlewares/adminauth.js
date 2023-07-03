const authenticate = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
      // O usuário está autenticado, pode prosseguir
      next();
    } else {
      // O usuário não está autenticado, redireciona para a página de login ou retorna um erro
      res.redirect('/login'); // Redireciona para a página de login
      // res.status(401).send('Unauthorized'); // Retorna um erro 401 Unauthorized
    }
  };

  module.exports = authenticate;