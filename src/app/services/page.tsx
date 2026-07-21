import { services } from "@/data/site";

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Services</p>
          <h1>Affordable packages for first websites.</h1>
          <p>Pricing is launch-stage and scope-led. Domains, paid services and deposits are handled before client work begins.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell service-grid">
          {services.map((service) => (
            <article className="service" key={service.title}>
              <div>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
              </div>
              <span className="price">{service.price}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
