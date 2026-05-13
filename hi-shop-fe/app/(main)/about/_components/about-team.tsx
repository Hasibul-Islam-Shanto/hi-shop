import { Github, Linkedin, Twitter } from "lucide-react"

const TEAM = [
  {
    name: "Maya Chen",
    role: "Creative Director",
    initials: "MC",
    color: "bg-primary",
    bio: "Former Vogue editor with 12 years shaping editorial fashion narratives.",
  },
  {
    name: "Jordan Lee",
    role: "Head of Curation",
    initials: "JL",
    color: "bg-secondary",
    bio: "Luxury retail veteran who has sourced products from over 40 countries.",
  },
  {
    name: "Alex Rivera",
    role: "Lead Engineer",
    initials: "AR",
    color: "bg-tertiary",
    bio: "Previously at Shopify and Stripe. Passionate about seamless user experiences.",
  },
  {
    name: "Priya Sharma",
    role: "Brand Director",
    initials: "PS",
    color: "bg-primary",
    bio: "Built brand partnerships for three of Europe's top fashion platforms.",
  },
  {
    name: "Chris Tate",
    role: "Head of Logistics",
    initials: "CT",
    color: "bg-secondary",
    bio: "Optimised delivery networks that now ship to 35+ countries.",
  },
  {
    name: "Sam Ortiz",
    role: "Community Lead",
    initials: "SO",
    color: "bg-tertiary",
    bio: "Built and scaled communities of over 100K members across three brands.",
  },
]

const SOCIALS = [Twitter, Linkedin, Github]

const AboutTeam = () => {
  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <span className="label-text text-primary mb-3 block">The People</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-3">Meet the Team</h2>
        <p className="text-on-surface-variant max-w-md mx-auto text-sm leading-relaxed">
          A small, focused team with a big obsession for quality, design, and the people who shop
          with us every day.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM.map((member) => (
          <div
            key={member.name}
            className="bg-card rounded-2xl p-5 ghost-border card-premium flex gap-4 items-start"
          >
            <div
              className={`h-12 w-12 rounded-2xl ${member.color} flex items-center justify-center text-base font-bold text-primary-foreground shrink-0`}
            >
              {member.initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface">{member.name}</p>
              <p className="text-[11px] text-primary font-semibold mb-2">{member.role}</p>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3">{member.bio}</p>

              <div className="flex items-center gap-2">
                {SOCIALS.map((Icon, i) => (
                  <button
                    key={i}
                    aria-label="Social link"
                    className="h-6 w-6 rounded-lg bg-surface-container ghost-border flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <Icon className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AboutTeam
