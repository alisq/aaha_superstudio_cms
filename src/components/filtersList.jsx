import { useState, useEffect, useRef, useMemo } from "react";
import { slugify } from "../utils/slugify";
import submissions from '../data/submissions.json';

const allStudios = ["Community-Centric Housing for Rural and Regional Canada — Athabasca University",
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

const allDemands = ["Tax Gentrification to build Community Land Trusts", 
    "Challenge existing zoning constraints to provide alternative housing types, density, intensification and modes of tenure", 
    "Collective Ownership", 
    "Intentional Communities for Unhoused People", 
    "All Urban Housing Development Must Include Accessible Public Space", 
    "Reparative Architecture", 
    "Demand housing that evolve with people, adapt to climate, and foster collective life", 
    "Mutual Aid Housing", 
    "Redistribute Power in the Housing Process and  Legitimize and Support Incremental Self-Directed Building", 
    "Landback", 
    "Surplus Properties for Housing"];

    const allTags = ["Community land trusts",
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

function FiltersList({ activeFilter, setActiveFilter }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const filtersRef = useRef(null);

    // Extract unique values from submissions
    const { studios, demands, tags } = useMemo(() => {
        const studioSet = new Set();
        const demandSet = new Set();
        const tagSet = new Set();

        submissions.forEach(submission => {
            // Extract studios
            if (submission.Home_Studio) {
                const studioName = submission.Home_Studio.split(" — ")[0];
                studioSet.add(studioName);
            }

            // Extract demands
            if (submission.Demands) {
                submission.Demands.split("—, ").forEach(demand => {
                    const trimmed = demand.replace("—", "").trim();
                    if (trimmed) {
                        demandSet.add(trimmed);
                    }
                });
            }

            // Extract tags
            if (submission.Tags) {
                submission.Tags.split(",").forEach(tag => {
                    const trimmed = tag.trim();
                    if (trimmed) {
                        tagSet.add(trimmed);
                    }
                });
            }
        });

        // Filter the static lists to only include items that exist in submissions
        const filteredStudios = allStudios.filter(studio => {
            const studioName = studio.split(" — ")[0];
            return studioSet.has(studioName);
        });

        const filteredDemands = allDemands.filter(demand => {
            return demandSet.has(demand);
        });

        const filteredTags = allTags.filter(tag => {
            return tagSet.has(tag);
        });

        return {
            studios: filteredStudios,
            demands: filteredDemands,
            tags: filteredTags
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filtersRef.current && !filtersRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        if (openDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdown]);

    const handleFilterSelect = (filterClass, categoryPrefix) => {
        // If "All" is selected (empty string), clear the filter if it belongs to this category
        if (filterClass === "") {
            if (activeFilter && activeFilter.startsWith(categoryPrefix)) {
                setActiveFilter(null);
            }
        } else {
            setActiveFilter(filterClass);
        }
        setOpenDropdown(null);
    };

    const toggleDropdown = (dropdownId) => {
        setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
    };

    // Get the current display value for each dropdown
    const getStudioDisplay = () => {
        if (activeFilter && activeFilter.startsWith('s_')) {
            const studio = studios.find(item => `s_${slugify(item.split(" — ")[0])}` === activeFilter);
            return studio || "All Studios";
        }
        return "All Studios";
    };

    const getDemandDisplay = () => {
        if (activeFilter && activeFilter.startsWith('d_')) {
            const demand = demands.find(item => `d_${slugify(item)}` === activeFilter);
            return demand || "All Demands";
        }
        return "All Demands";
    };

    const getTagDisplay = () => {
        if (activeFilter && activeFilter.startsWith('t_')) {
            const tag = tags.find(item => `t_${slugify(item)}` === activeFilter);
            return tag || "All Tags";
        }
        return "All Tags";
    };

    const FilterDropdown = ({ id, label, displayValue, options, categoryPrefix, getFilterClass }) => {
        const isOpen = openDropdown === id;
        
        return (
            <div className="filter-dropdown">
                <div className="dropdown-wrapper">
                    <button
                        type="button"
                        className="dropdown-button"
                        onClick={() => toggleDropdown(id)}
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                    >
                        {displayValue}
                        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                    </button>
                    <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
                        <button
                            type="button"
                            className={`dropdown-option ${isOpen ? 'rolling-down' : 'rolling-up'}`}
                            style={{ animationDelay: '0s' }}
                            onClick={() => handleFilterSelect("", categoryPrefix)}
                        >
                            All {label}s
                        </button>
                        {options.map((item, index) => {
                            const filterClass = getFilterClass(item);
                            const isActive = activeFilter === filterClass;
                            const delay = (index + 1) * 0.02; // Stagger each option by 20ms
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    className={`dropdown-option ${isActive ? 'active' : ''} ${isOpen ? 'rolling-down' : 'rolling-up'}`}
                                    style={{ animationDelay: `${delay}s` }}
                                    onClick={() => handleFilterSelect(filterClass, categoryPrefix)}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return(
        <section id="filters" ref={filtersRef}>
            <FilterDropdown
                id="studio-filter"
                label="Studio"
                displayValue={getStudioDisplay()}
                options={studios}
                categoryPrefix="s_"
                getFilterClass={(item) => `s_${slugify(item.split(" — ")[0])}`}
            />
            
            <FilterDropdown
                id="demand-filter"
                label="Demand"
                displayValue={getDemandDisplay()}
                options={demands}
                categoryPrefix="d_"
                getFilterClass={(item) => `d_${slugify(item)}`}
            />
            
            <FilterDropdown
                id="tag-filter"
                label="Tag"
                displayValue={getTagDisplay()}
                options={tags}
                categoryPrefix="t_"
                getFilterClass={(item) => `t_${slugify(item)}`}
            />
        </section>
    )
}

export default FiltersList