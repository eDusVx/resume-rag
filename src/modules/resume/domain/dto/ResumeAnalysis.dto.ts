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
    resumo: string;
    tempo_experiencia_estimado: string;
    cargo_atual_ou_ultimo: string;
    empresa_atual_ou_ultima: string;
  };
  skills: {
    linguagens: string[];
    frameworks: string[];
    bancos_de_dados: string[];
    cloud_devops: string[];
    arquitetura_e_conceitos: string[];
  };
  formacao_academica: Array<{
    curso: string;
    instituicao: string;
    ano_conclusao: string | null;
  }>;
  idiomas: Array<{
    idioma: string;
    nivel: string;
  }>;
}
