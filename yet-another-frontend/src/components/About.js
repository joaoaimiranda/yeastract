import React from "react";

export default function About() {
  return (
    <div className="container mx-auto p-6">
      {/* Welcome Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Welcome to YEASTRACT+</h2>
        <p className="text-lg">
          The <b>YEASTRACT+</b> (<b>Y</b>east <b>S</b>earch for <b>T</b>
          ranscriptional <b>R</b>egulators <b>A</b>nd <b>C</b>onsensus <b>T</b>
          racking)<b>+</b> portal is a wide-scope tool for the analysis and
          prediction of transcription regulatory associations at the gene and
          genomic levels in yeasts of biotechnological or human health
          relevance. It provides bioinformatics tools for the prediction and
          visualization of gene and genomic regulation based on orthologous
          regulatory associations described for other yeast species, based on
          comparative genomics.
        </p>
      </section>

      {/* Acknowledgments Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Acknowledgments</h2>
        <p className="text-lg">
          This work was partially supported by the Portuguese{" "}
          <i>Fundação para a Ciência e Tecnologia</i> through POSC and PDTC,
          namely via:
        </p>

        <img
          className="size-auto shrink-0 py-4"
          src="/img/logo_posc.jpg"
          alt="logo POSC"
        />

        <ul className="list-disc list-inside mb-4 text-lg">
          <li>
            Project grant POSC/EIA/57398/2004: DBYeast:{" "}
            <i>
              Infrastructures and algorithms for analysis and identification of
              gene regulatory networks
            </i>
          </li>
          <li>
            Project grant PDTC/BIO/56838/2004:{" "}
            <i>
              Insights into the complex regulatory networks acting in Yeast
              cells challenged with drugs/chemical stresses: genome-wide
              expression approaches supported by bioinformatics
            </i>
          </li>
          <li>
            National funds through Programa Operacional Regional de Lisboa 2020,
            LISBOA-01-0145-FEDER-022231 – the Biodata.pt Research
            Infrastructure.
          </li>
        </ul>

        <p className="text-lg">
          The information about Yeast genes other than documented regulations,
          potential regulations and the TF binding sites contained in YEASTRACT
          are gathered from; Saccharomyces Genome Database (SGD), Gene Ontology
          (GO) Consortium and Regulatory Sequence Analysis (RSA) Tools.
        </p>
      </section>

      {/* Contact Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Contact</h2>
        <p className="text-lg">
          Please send your comments, questions or suggestions to{" "}
          <a
            href="mailto:contact@yeastract.com"
            className="text-blue-500 underline"
          >
            contact@yeastract.com
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Team</h2>
        <div className="mb-4">
          <a
            href="https://www.inesc-id.pt/research-areas/automated-reasoning-and-software-reliability/"
            className="text-blue-500 underline"
          >
            <h3 className="text-xl font-semibold">
              Reasoning and Software Reliability Research Group
            </h3>
          </a>
          <ul className="list-disc list-inside">
            <li>
              <strong>Pedro T. Monteiro, PhD</strong>, Associate Professor IST,{" "}
              <a
                href="http://pedromonteiro.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                homepage
              </a>
            </li>
            <li>
              <strong>Jorge Oliveira, PhD</strong>,{" "}
              <a
                href="https://web.ist.utl.pt/jorge.oliveira/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                homepage
              </a>
            </li>
            <li>
              <strong>João Miranda, PhD student</strong>,{" "}
              <a
                href="https://www.cienciavitae.pt/B915-D668-DF0C"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                homepage
              </a>
            </li>
          </ul>
        </div>
        <div className="mb-4">
          <a
            href="http://groups.ist.utl.pt/bsrg/"
            className="text-blue-500 underline"
          >
            <h3 className="text-xl font-semibold">
              Biological Sciences Research Group
            </h3>
          </a>
          <ul className="list-disc list-inside">
            <li>
              <strong>Miguel C. Teixeira, PhD</strong>, Full Professor IST,{" "}
              <a
                href="https://sites.google.com/view/ibb-tecnico-bsrg-funpath-lab/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                FunPath Lab
              </a>
            </li>
            <li>
              <strong>Diogo Couceiro, PhD student</strong>,{" "}
              <a
                href="https://sites.google.com/view/ibb-tecnico-bsrg-funpath-lab/home/team/diogo-couceiro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                homepage
              </a>
            </li>
            <li>
              <strong>Inês Costa, PhD student</strong>,{" "}
              <a
                href="https://sites.google.com/view/ibb-tecnico-bsrg-funpath-lab/home/team/in%C3%AAs-costa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                homepage
              </a>
            </li>
            <li>
              <strong>Maria Zolotareva, PhD student</strong>,{" "}
              <a
                href="https://sites.google.com/view/ibb-tecnico-bsrg-funpath-lab/home/team/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                homepage
              </a>
            </li>
            <li>
              <strong>Luís Coutinho, MSc student</strong>,{" "}
              <a
                href="https://sites.google.com/view/ibb-tecnico-bsrg-funpath-lab/home/team/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                homepage
              </a>
            </li>
            <li>
              <strong>Isabel Sá-Correia, PhD</strong>, Full Professor IST,{" "}
              <a
                href="https://ibb.tecnico.ulisboa.pt/people/members/Isabel-Sa-Correia/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                homepage
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Cite Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">How to cite Yeastract</h2>
        <h3 className="text-lg font-bold mb-2">
          If you use our resources, please cite:
        </h3>
        <p className="text-base">
          M.C. Teixeira, R. Viana, M. Palma, J. Oliveira, M. Galocha, M.N. Mota,
          D. Couceiro, M.G. Pereira, M. Antunes, I.V. Costa, P. Pais, C. Parada,
          C. Chaouiya, I. Sá-Correira, P.T. Monteiro (2023),{" "}
          <b>
            YEASTRACT+: a portal for the exploitation of global transcription
            regulation and metabolic model data in yeast biotechnology and
            pathogenesis
          </b>
          , <i>Nucleic Acids Research</i>, 51, D785–D791,{" "}
          <a
            href="https://doi.org/10.1093/nar/gkac1041"
            className="text-blue-500 underline"
          >
            doi:10.1093/nar/gkac1041
          </a>
        </p>
      </section>
    </div>
  );
}
