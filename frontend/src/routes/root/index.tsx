import { Layout } from "../../components/layout";

import heroImgSrc from "../../assets/hero.png";

export default function Root() {
  return (
    <Layout>
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <img src={heroImgSrc} />
            <p className="py-6">
              <span className="font-bold">BONK</span> - a protocol that can be
              used by a service provider to commit to some agreement with their
              clients, who can slash them retroactively for misbehavior.
            </p>
            <button className="btn">Let's bonk</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
