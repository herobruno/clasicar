var express = require("express");
var app = express();
const connection = require("./models/db");
const bodyParser = require("body-parser");
const sequelize = require("sequelize");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const userauth = require("./middlewares/userauth");
const Carro = require('./poo.js');
const ejs = require('ejs');
const fs = require('fs');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Proposta = require('./models/Proposta');
const Carros = require("./models/Carros");
const multer = require('multer');
const sharp = require('sharp');
const { Op } = require('sequelize');
const authenticate = require("./middlewares/adminauth");
// Dados do carro
const carro = new Carro('Marca', 'preco', 'localizacao', 'descricao,imagem');

// Caminho para a pasta de views
const viewsPath = __dirname + '/views';

// Lista de nomes de arquivos EJS
const fileNames = ['cadastro.ejs', 'index.ejs', 'info.ejs', 'store.ejs'];

// Loop para percorrer os nomes de arquivos
fileNames.forEach(fileName => {
  // Caminho completo para o arquivo EJS
  const filePath = viewsPath + '/' + fileName;

  try {
    // Leitura do arquivo EJS
    const template = fs.readFileSync(filePath, 'utf-8');

    // Dados a serem passados para o EJS
    const data = { carro: carro, errorMessage: '' }; // Passa o objeto 'carro' como propriedade 'carro' no objeto de dados 'data'

    // Renderização do arquivo EJS em HTML
    const html = ejs.render(template, data);

    // Nome do arquivo HTML a ser salvo
    const htmlFileName = fileName.replace('.ejs', '.html');

    // Caminho completo para o arquivo HTML
    const htmlFilePath = __dirname + '/' + htmlFileName;

    // Salvar o HTML gerado em um arquivo
    fs.writeFileSync(htmlFilePath, html, 'utf-8');

    console.log(`Arquivo ${htmlFileName} salvo com sucesso.`);

  } catch (err) {
    console.error(`Erro ao renderizar o arquivo ${fileName}: ${err.message}`);
  }
});



// Configurando a sessão do usuário
app.use(session({

  cookie: { maxAge: 10000000000000000000 },
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true

}));

// Configurando o template engine EJS e a pasta de arquivos estáticos
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/carroscriados', express.static(path.join(__dirname, 'carroscriados')));

// Configurando o body-parser para receber dados do formulário via POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/store', async (req, res) => {
  try {
    const carrosEncontrados = await Carros.findAll();

    if (carrosEncontrados.length > 0) {
      const carrosComImagem = await Promise.all(
        carrosEncontrados.map(async (carro) => {
          if (carro.imagem) {
            const imagemBuffer = await fs.promises.readFile(carro.imagem);
            const imagemBase64 = imagemBuffer.toString('base64');
            return { ...carro.dataValues, imagemBase64 };
          } else {
            return carro;
          }
        })
      );

      res.render('store.ejs', { carros: carrosComImagem });
    } else {
      res.send('Nenhum carro encontrado.');
    }
  } catch (error) {
    console.error('Erro ao obter carros:', error);
    res.sendStatus(500);
  }
});
// Criação dos objetos Carro
app.get('/', (req, res) => {
  res.render('index', { carro: carro1 });
});
//criaçao da rota proposta
app.get('/proposta', (req, res) => {
  res.render('proposta.ejs');
});
//Crianção de novos carros 
app.get('/adicionar-carro', (req, res) => {
  res.render('createcarros.ejs');
});
app.get('/carro2', (req, res) => {
  res.render('index', { carro: carro2 });
});

// Rota da loja, acessível somente com autenticação do usuário
app.get("/store", userauth, (req, res) => {
  res.render("store.ejs");
});

// Rota de cadastro de usuário
app.get("/cadastro", (req, res) => {
  res.render("cadastro.ejs");
});
// Rota inicial
app.get("/", (req, res) => {
  res.render("index");
});
//Rota de cadastro passando mensagens de erro
app.get('/cadastro', (req, res) => {
  res.render('cadastro', { errorMessage: null }); 
});
//Rota de login
app.get("/cadastro2", (req, res) => {
  res.render("cadastro2");
});
app.get("/", (req, res) => {
  if (req.session.user) {
    // Renderizar a página principal para usuários autenticados
    res.render("index", { user: req.session.user });
  } else {
    // Renderizar a página de login para usuários não autenticados
    res.render("cadastro");
  }
});
//Rota para retornar carros cadastrados no POO e renderizar os atributos junto com o template
app.get('/carro-info', (req, res) => {
  const searchTerm = req.query.searchTerm;
  
  try {
    let carro;

    // Verifique o valor do searchTerm e atribua o carro correspondente
    if (searchTerm === 'Fusca') {
      carro = carro1;
    } else if (searchTerm === 'Chevette') {
      carro = carro2;
    } else {
      // Caso o carro não seja encontrado, exiba uma mensagem de erro
      res.send('Car not found!');
      return;
    }

    // Renderize o template info.ejs e passe os atributos do carro como dados
    res.render('info.ejs', { carro });
  } catch (error) {
    console.error('Erro ao obter informações do carro:', error);
    res.sendStatus(500);
  }
});
//logica para buscar um carro que esta no poo.js
const carro1 = new Carro('Porsche', 'R$ 45.000', 'Rio de Janeiro', ['Um clássico em excelente estado de conservação. Esse modelo icônico é perfeito para os amantes de carros vintage. Com um design elegante e uma história rica, Seu motor potente e sua dirigibilidade suave tornam cada viagem uma experiência única. Não perca a oportunidade de adquirir esse tesouro automobilístico.'], '../assets/carro3.png');


//Rota para  filtrar os carro no banco de dados por um imput de busca
app.get('/info', async (req, res) => {
  const searchTerm = req.query.searchTerm;

  try {
    const carrosEncontrados = await Carros.findAll({
      where: {
        nome: {
          [Op.like]: `%${searchTerm}%`
        }
      }
    });

    if (carrosEncontrados.length > 0) {
      const carrosComImagem = await Promise.all(
        carrosEncontrados.map(async (carro) => {
          if (carro.imagem) {
            const imagemBuffer = await fs.promises.readFile(carro.imagem);
            const imagemBase64 = imagemBuffer.toString('base64');
            return { ...carro.dataValues, imagemBase64 };
          } else {
            return carro;
          }
        })
      );

      res.render('busca.ejs', { carros: carrosComImagem });
    } else {
      res.send('Car not found!');
    }
  } catch (error) {
    console.error('Erro ao pesquisar carros:', error);
    res.sendStatus(500);
  }
});


//Rota post para cadastrar o usuario no banco de dados

app.post('/cadastrar', async (req, res) => {
  const { email, password, nome_completo, data_nasc } = req.body;

  try {
    // Verifica se o usuário já está cadastrado
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.render('cadastro2', { error: 'Usuário já cadastrado.' });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário no banco de dados
    const newUser = await User.create({ email, password: hashedPassword });

    // Cria o perfil do usuário com o user_id correto
    const newProfile = await Profile.create({ nome_completo, data_nasc, user_id: newUser.id });

    res.redirect("cadastro");
  } catch (error) {
    return res.render('cadastro2', { error: 'Erro ao cadastrar usuário.' });
  }
});

const storage = multer.memoryStorage(); // Usar a memória para armazenar os arquivos temporariamente

const upload = multer({ storage: storage });

//Rota para criar novos carros pelo adm e colocar no banco de dados
app.post('/carros', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, marca, cambio, combustivel, quilometragem, motor, ano_modelo, descricao, cidade, estado, pais, preco } = req.body;
    const imagemBuffer = req.file.buffer; // Obter o buffer da imagem

    // Redimensionar a imagem para um tamanho menor (exemplo: 800x600 pixels)
    const imagemRedimensionada = await sharp(imagemBuffer)
      .resize(800, 600)
      .toBuffer();

    // Gerar um nome único para a imagem
    const nomeImagem = `${Date.now()}-${req.file.originalname}`;

    // Salvar a imagem no diretório desejado
    const caminhoImagem = path.join(__dirname, 'carroscriados', nomeImagem);
    await fs.promises.writeFile(caminhoImagem, imagemRedimensionada);

    // Salvar os dados no banco de dados
    const novoCarro = await Carros.create({ nome, marca, cambio, combustivel, quilometragem, motor, ano_modelo, descricao, cidade, estado, pais, preco ,imagem: caminhoImagem });

    res.status(201).json(novoCarro);
  } catch (error) {
    console.error('Erro ao adicionar o carro:', error);
    res.status(500).json({ error: 'Erro ao adicionar o carro' });
  }
});


//Rota de login
app.post('/processar', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe no banco de dados
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.render('cadastro.ejs', { error: 'Usuário não encontrado.' });
    }

    // Verifica se a senha está correta
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.render('cadastro.ejs', { error: 'Senha incorreta.' });
    }

    // Define a propriedade 'user' na sessão com os dados do usuário
    req.session.user = {
      id: user.id,
      email: user.email
    };

    res.redirect("/");
  } catch (error) {
    console.error('Erro ao processar usuário:', error);
    res.render('cadastro.ejs', { error: 'Erro ao processar usuário.' });
  }
});
// Rota para receber os dados do formulário
app.post('/enviar-proposta', async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.session.user) {
      // Se o usuário não estiver autenticado, redirecione-o para a página de login
      res.redirect('/cadastro');
      return;
    }

    // Extrai os dados do corpo da requisição
    const { nome, email, proposta } = req.body;

    // Obtém o ID do usuário autenticado a partir da sessão
    const userId = req.session.user.id;

    // Cria uma proposta relacionada ao usuário
    const novaProposta = await Proposta.create({
      nome,
      email,
      proposta,
  
    });

    // Redireciona o usuário para uma página de sucesso
    res.redirect('/sucesso.html');
  } catch (error) {
    console.error('Erro ao criar a proposta:', error);
    // Redireciona o usuário para uma página de erro
    res.redirect('/erro.html');
  }
});

(async () => {
  try {
    await connection.sync();
    console.log('Tabela "carros" criada com sucesso.');
  } catch (error) {
    console.error('Erro ao criar tabela "carros":', error);
  }
})();

// Rota POST para buscar todos os carros do banco de dados e renderizar no template store.ejs
app.get("/store", userauth, async (req, res) => {
  try {
    const carros = await Carros.findAll(); // Obtém todos os carros do banco de dados
    res.render("store.ejs", { carros }); // Passa o array de carros ao renderizar o template
  } catch (error) {
    console.error("Erro ao obter carros:", error);
    res.status(500).json({ error: "Erro ao obter carros" });
  }
});

app.get('/carros/:nome', (req, res) => {
  const nomeCarro = req.params.nome;

  // Buscar os dados do carro com base no nome
  Carros.findOne({ where: { nome: nomeCarro } })
    .then((carro) => {
      // Verificar se o carro foi encontrado
      if (!carro) {
        res.status(404).send('Carro não encontrado');
        return;
      }

      // Ler a imagem do carro como um arquivo binário
      try {
        const imagemBinaria = fs.readFileSync(carro.imagem);

        // Converte a imagem para Base64
        const imagemBase64 = imagemBinaria.toString('base64');

        // Passar os dados do carro e a imagem em Base64 para o template e renderizar a página info.ejs
        res.render('info', { carro, imagemBase64 });
      } catch (error) {
        console.error('Erro ao ler a imagem:', error);
        res.status(500).send('Erro interno do servidor');
      }
    })
    .catch((error) => {
      console.error('Erro ao buscar o carro:', error);
      res.status(500).send('Erro interno do servidor');
    });
});
//Database
connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com o banco de dados!")
    })
    .catch((msgErro) => {
        console.log(msgErro);
    })



//instancia do servidor
app.listen(3000, () => {
  console.log('Servidor rodando!');
});



