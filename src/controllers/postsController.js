import { getTodosOsPosts, criarPost, atualizarPost} from "../models/postsModel.js";
import fs from "fs";
import gerarDescricaoComGemini from "../services/geminiService.js"

/**
 * Lista todos os posts existentes.
 * 
 * @param {Object} req Objeto de requisição HTTP.
 * @param {Object} res Objeto de resposta HTTP.
 */
export async function listarPosts(req, res) {
  // Chama a função para obter todos os posts do banco de dados.
  const posts = await getTodosOsPosts();

  // Envia uma resposta HTTP com status 200 (sucesso) e os posts no formato JSON.
  res.status(200).json(posts);
}

/**
 * Cria um novo post.
 * 
 * @param {Object} req Objeto de requisição HTTP.
 * @param {Object} res Objeto de resposta HTTP.
 */


export async function postarNovoPost(req, res) {
  const novoPost = req.body;

  try {
    // Chama a função para criar um novo post no banco de dados.
    const postCriado = await criarPost(novoPost);

    // Envia uma resposta HTTP com status 200 (sucesso) e o post criado no formato JSON.
    res.status(200).json(postCriado);
  } catch (erro) {
    console.error(erro.message);
    // Envia uma resposta HTTP com status 500 (erro interno do servidor) e uma mensagem de erro.
    res.status(500).json({ "Erro": "Falha na Requisição." });
  }
}

/**
 * Faz o upload de uma imagem e cria um novo post.
 * 
 * @param {Object} req Objeto de requisição HTTP.
 * @param {Object} res Objeto de resposta HTTP.
 */
export async function uploadImagem(req, res) {
  // Cria um objeto com os dados do novo post, incluindo o nome original da imagem.
  const novoPost = {
    descricao: "",
    imgUrl: req.file.originalname,
    alt: ""
  };

  try {
    // Chama a função para criar um novo post no banco de dados.
    const postCriado = await criarPost(novoPost);

    // Gera um novo nome para a imagem, utilizando o ID do post criado.
    const imagemAtualizada = `uploads/${postCriado.insertedId}.png`;

    // Renomeia o arquivo da imagem para o novo nome.
    fs.renameSync(req.file.path, imagemAtualizada);

    // Envia uma resposta HTTP com status 200 (sucesso) e o post criado no formato JSON.
    res.status(200).json(postCriado);
  } catch (erro) {
    console.error(erro.message);
    // Envia uma resposta HTTP com status 500 (erro interno do servidor) e uma mensagem de erro.
    res.status(500).json({ "Erro": "Falha na Requisição." });
  }
}

export async function atualizarNovoPost(req, res) {
  const id = req.params.id;
  const urlImagem = `http://localhost:3000/${id}.png`

  try {
    const imgBuffer = fs.readFileSync(`uploads/${id}.png`)
    const descricao = await gerarDescricaoComGemini(imgBuffer)

    const post = {
      imgUrl:urlImagem,
      descricao: descricao,
      alt: req.body.alt
    }

    // Chama a função para atualizar um novo post no banco de dados.
    const postCriado = await atualizarPost(id, post);

    // Envia uma resposta HTTP com status 200 (sucesso) e o post atualizado no formato JSON.
    res.status(200).json(postCriado);
  } catch (erro) {
    console.error(erro.message);
    // Envia uma resposta HTTP com status 500 (erro interno do servidor) e uma mensagem de erro.
    res.status(500).json({ "Erro": "Falha na Requisição." });
  }
}