import { Layout } from "../../components/layout";

export default function About() {
  return (
    <Layout>
      <div className="flex flex-row justify-center">
        <a
          className="underline mt-10"
          href="https://github.com/UMAprotocol/bonk#bonk"
          target="_blank"
          rel="noreferrer"
        >
          Go to README.md
        </a>
      </div>
    </Layout>
  );
}
