
export type PdfGenresOptions = "Ficção" | "Não ficção" | "Romance" | "Mistério" | "Suspense" | "Terror" | "Fantasia" | "Ficção científica" | "Distopia" | "Aventura" | "História" | "Biografia" | "Autobiografia" | "Poesia" | "Drama" | "Comédia" | "Ensaios" | "Filosofia" | "Política" | "Religião" | "Autoajuda" | "Negócios" | "Economia" | "Ciência" | "Tecnologia" | "Arte" | "Fotografia" | "Viagem" | "Educação" | "Culinária" 
type Genres = { genre:PdfGenresOptions, description:string}[];

export default class PdfGenres {

    genres:Genres = [
        { genre: "Ficção", description: "Engloba histórias imaginárias que podem ser baseadas em eventos fictícios, mundos inventados, ou situações que não ocorreram na realidade." },
        { genre: "Não ficção", description: "Engloba uma variedade de tópicos baseados em fatos reais, incluindo biografias, ensaios, ciência, economia, filosofia, entre outros." },
        { genre: "Romance", description: "Foca em relacionamentos interpessoais e histórias de amor entre personagens, muitas vezes com um enredo emocionalmente envolvente." },
        { genre: "Mistério", description: "Centra-se na resolução de um enigma, crime ou situação inexplicável, mantendo o suspense e a intriga ao longo da narrativa." },
        { genre: "Suspense", description: "Cria tensão e expectativa no leitor através de situações de perigo, mistério ou ameaça iminente, mantendo-o ansioso pelo desfecho." },
        { genre: "Terror", description: "Explora elementos do medo, do sobrenatural e do horror, com o objetivo de provocar emoções intensas e arrepios no leitor." },
        { genre: "Fantasia", description: "Apresenta mundos imaginários, criaturas mágicas e elementos sobrenaturais que não existem na realidade, permitindo a exploração de temas e conceitos impossíveis." },
        { genre: "Ficção científica", description: "Explora conceitos científicos e tecnológicos especulativos, muitas vezes ambientados no futuro ou em mundos alternativos, para discutir questões sociais, políticas e éticas." },
        { genre: "Distopia", description: "Descreve sociedades ou mundos futuros imaginários onde as condições de vida são extremamente opressivas, injustas ou degradantes." },
        { genre: "Aventura", description: "Envolve viagens emocionantes, perigosas ou desafiadoras, com ênfase na exploração, descoberta e superação de obstáculos." },
        { genre: "História", description: "Foca em narrativas e análises de eventos, pessoas e períodos específicos do passado, incluindo estudos detalhados sobre sociedades, culturas, políticas, guerras, revoluções e outros acontecimentos históricos." },
        { genre: "Biografia", description: "Conta a história da vida de uma pessoa, geralmente escrita por outra pessoa e baseada em pesquisa e entrevistas, oferecendo insights sobre suas realizações, personalidade e impacto." },
        { genre: "Autobiografia", description: "É uma narrativa escrita pela própria pessoa sobre sua própria vida, abordando experiências, reflexões e perspectivas pessoais." },
        { genre: "Poesia", description: "Explora emoções, sentimentos e ideias através de uma linguagem estilizada e muitas vezes metafórica, buscando transmitir significados profundos de forma artística." },
        { genre: "Drama", description: "Apresenta conflitos humanos, emocionais e morais através de diálogos e ações de personagens, muitas vezes explorando temas como amor, tragédia, conflitos familiares e questões sociais." },
        { genre: "Comédia", description: "Tem o objetivo de entreter e fazer o leitor rir, utilizando humor, ironia e situações cômicas para abordar temas leves e cotidianos." },
        { genre: "Ensaios", description: "Apresenta reflexões pessoais, análises críticas ou argumentações sobre diversos temas, oferecendo insights e perspectivas únicas do autor." },
        { genre: "Filosofia", description: "Explora questões fundamentais relacionadas à existência humana, à natureza da realidade, ao conhecimento, à ética e à moralidade, buscando compreender o significado da vida e do universo." },
        { genre: "Política", description: "Analisa questões relacionadas ao governo, poder, sistemas políticos, ideologias e questões sociais, buscando compreender e influenciar a organização da sociedade." },
        { genre: "Religião", description: "Explora crenças, práticas e doutrinas religiosas, bem como sua influência na cultura, na história e na vida das pessoas." },
        { genre: "Autoajuda", description: "Oferece orientações, conselhos e estratégias para ajudar os leitores a melhorar aspectos de suas vidas, como autoestima, relacionamentos, saúde mental, carreira, entre outros." },
        { genre: "Negócios", description: "Foca em temas relacionados ao mundo dos negócios, incluindo empreendedorismo, gestão, estratégia, finanças, marketing, liderança e inovação." },
        { genre: "Economia", description: "Analisa questões relacionadas à produção, distribuição e consumo de bens e serviços, bem como políticas econômicas, mercados financeiros e globalização." },
        { genre: "Ciência", description: "Explora descobertas, teorias e avanços científicos em diversas áreas, como física, química, biologia, astronomia, geologia, entre outras." },
        { genre: "Tecnologia", description: "Foca em inovações, avanços e impactos da tecnologia na sociedade, na cultura, na economia e na vida cotidiana, abordando temas como computação, internet, inteligência artificial, biotecnologia, entre outros." },
        { genre: "Arte", description: "Explora formas de expressão artística, como pintura, escultura, música, dança, teatro, cinema, literatura, arquitetura, entre outras, bem como suas influências e significados culturais." },
        { genre: "Fotografia", description: "Apresenta imagens visuais capturadas por meio da fotografia, explorando técnicas, estilos, temas e significados estéticos, culturais e emocionais." },
        { genre: "Viagem", description: "Descreve experiências de viagem, destinos, culturas e aventuras pelo mundo, oferecendo inspiração, informações práticas e insights sobre diferentes lugares e pessoas." },
        { genre: "Educação", description: "Foca em métodos, teorias e práticas relacionadas ao processo de aprendizagem, ensino, pedagogia e formação acadêmica, abordando questões educacionais em diferentes contextos e níveis de ensino." },
        { genre: "Culinária", description: "Apresenta receitas, técnicas de preparo, ingredientes, culturas gastronômicas e aspectos históricos relacionados à comida e à culinária, incentivando a experimentação e a apreciação da gastronomia." }
    ];   
    
    relatedGenres:Record<PdfGenresOptions, PdfGenresOptions[]> = {
        "Ficção":[],
        "Não ficção":[],
        "Romance":[],
        "Mistério":[],
        "Suspense":[],
        "Terror":[],
        "Fantasia":[],
        "Ficção científica":[],
        "Distopia":[],
        "Aventura":[],
        "História":["Educação",],
        "Biografia":[],
        "Autobiografia":[],
        "Poesia":[],
        "Drama":[],
        "Comédia":[],
        "Ensaios":[],
        "Filosofia":["Educação",],
        "Política":["Educação",],
        "Religião":[],
        "Autoajuda":[],
        "Negócios":["Educação",],
        "Economia":["Educação",],
        "Ciência":["Educação", "Não ficção",],
        "Tecnologia":["Educação",],
        "Arte":["Educação",],
        "Fotografia":["Educação",],
        "Viagem":["Educação",],
        "Educação":["Não ficção",],
        "Culinária":["Educação", "Negócios",],
    }

    constructor() {

    };



};