class Carro {
  // Classe que representa um carro, com seus atributos e métodos
  constructor(marca, preco, localizacao, descricao, imagem) {
    // Método construtor, que recebe os atributos do carro e os atribui à instância
    this.marca = marca;
    this.preco = preco;
    this.localizacao = localizacao;
    this.descricao = descricao;
    this.imagem = imagem;
  }

  // Métodos getters para acessar os atributos do carro
  getMarca() {
    return this.marca;
  }

  getPreco() {
    return this.preco;
  }

  getLocalizacao() {
    return this.localizacao;
  }

  getDescricao() {
    return this.descricao;
  }

  getImagem() {
    return this.imagem;
  }
}
  
const carro1 = new Carro('Porsche', 'R$ 45.000', 'Rio de Janeiro', [' Um clássico em excelente estado de conservação. Esse modelo icônico é perfeito para os amantes de carros vintage. Com um design elegante e uma história rica, o Fusca é um verdadeiro símbolo de estilo e confiabilidade. Seu motor potente e sua dirigibilidade suave tornam cada viagem uma experiência única. Não perca a oportunidade de adquirir esse tesouro automobilístico.'], '../assets/carro3.png');

  
  // Exportação da classe para ser utilizada em outros arquivos
  module.exports = Carro;