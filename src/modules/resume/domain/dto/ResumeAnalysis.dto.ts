export interface ResumeAnalysisResult {
  candidato: {
    nome: string;
    email: string | null;
    telefone: string | null;
    links: {
      linkedin: string | null;
      github: string | null;
      portfolio: string | null;
    };
    cidade_estado: string | null;
  };
  profissional: {
    resumo: string; // Um parágrafo único e denso
    tempo_experiencia_estimado: string; // Ex: "5+ anos"
    cargo_atual_ou_ultimo: string;
    empresa_atual_ou_ultima: string;
  };
  skills: {
    linguagens: string[]; // Java, TS, Go...
    frameworks: string[]; // Spring, NestJS...
    bancos_de_dados: string[]; // Postgres, Mongo...
    cloud_devops: string[]; // AWS, Docker, K8s...
    arquitetura_e_conceitos: string[]; // DDD, SOLID...
  };
  formacao_academica: Array<{
    curso: string;
    instituicao: string;
    ano_conclusao: string | null;
  }>;
  idiomas: Array<{
    idioma: string;
    nivel: string; // Básico, Intermediário, Fluente
  }>;
}