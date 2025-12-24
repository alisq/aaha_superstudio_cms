import { slugify } from "../utils/slugify";

const studios = ["Community-Centric Housing for Rural and Regional Canada — Athabasca University",
"Graduating Project — British Columbia Institute of Technology",
"Housing, Community, City Building & Placemaking — Carleton University",
"Urban Housing Studio — Dalhousie University",
"Storied Lands — Laurentian University",
"Gorilla Park Housing – an exercise in constructive activism — McGill University",
"Living Cooperatively — Toronto Metropolitan University",
"The Architecture of Urban Housing — Toronto Metropolitan University",
"Counter Proposal Studio — Toronto Metropolitan University",
"Penser et construire l’architecture pour habiter la ville — Université de Montréal",
"Home Otherwise: Architecture, Agency, and Collective Housing Futures — University of British Columbia",
"The Porous Dwelling: Reimagining Housing as the Intersection of Architecture, Ecology, and Culture — University of Calgary",
"Manufacturing Otherwise — University of Manitoba",
"Architecture and the Right to Housing — University of Toronto",
"Infilling affordable housing within the Kensington Market Community Land Trust — University of Waterloo",
"Build Now to End Housing Alienation in Waterloo Region — University of Waterloo"];

const demands = ["Tax Gentrification to build Community Land Trusts", 
    "Challenge existing zoning constraints to provide alternative housing types, density, intensification and modes of tenure", 
    "Collective Ownership", 
    "Intentional Communities for Unhoused People", 
    "All Urban Housing Development Must Include Accessible Public Space", 
    "Reparative Architecture", 
    "Demand housing that evolve with people, adapt to climate, and foster collective life", 
    "Mutual Aid Housing", 
    "Redistribute Power in the Housing Process and  Legitimize and Support Incremental", 
    "Self-Directed Building", 
    "Landback", 
    "Surplus Properties for Housing"];

    const tags = ["Community land trusts",
"Cooperative housing",
"Decolonization",
"Financialization",
"Housing policy",
"Housing theory",
"Indigeneity",
"Pedagogy",
"Prefabrication",
"Housing Production",
"Participatory Design",
"Shared Spaces",
"Programmed Circulation",
"Flexible Spaces",
"Co-Housing",
"Co-Living",
"Courtyard Housing",
"Towers",
"Bar Buildings",
"Row Housing",
"Infill Housing",
"Laneway Housing",
"Multi-Plex Housing",
"Mixed Use",
"Land Back",
"Agriculture and Gardening"]

function FiltersList() {
    return(
        <section id="filters">
        <div>
            {studios.map((item, index) => (
                <ul key={index}>
                    <li><a href="#" data-filter={`.s_${slugify(item.split(" — ")[0])}`}>{item}</a></li>
                </ul>
            ))}

        </div>
        
        <div>
            {demands.map((item, index) => (
                <ul key={index}>
                    <li><a href="#" data-filter={`.d_${slugify(item)}`}>{item}</a></li>
                </ul>
            ))}
        </div>
        
        <div>
            {tags.map((item, index) => (
                <ul key={index}>
                    <li><a href="#" data-filter={`.t_${slugify(item)}`}>{item}</a></li>
                </ul>
            ))}
        </div>
        </section>
    )
}

export default FiltersList