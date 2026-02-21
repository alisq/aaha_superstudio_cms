import { useState, useEffect, useRef, useMemo } from "react";
import { slugify } from "../utils/slugify";
import parse from "html-react-parser";
import submissions from '../data/submissions.json';
import studiosData from '../data/studios.json';


const allStudios = studiosData.map(studio => `${(studio.title || '').trim()} — ${(studio.school || '').trim()}`);

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

        // Studios: filter studios.json list to only those with submissions
        const filteredStudios = allStudios.filter(studio => {
            const studioName = studio.split(" — ")[0];
            return studioSet.has(studioName);
        });

        // Demands and tags: master lists are built from cited values in submissions
        const demands = Array.from(demandSet).sort();
        const tags = Array.from(tagSet).sort();

        return {
            studios: filteredStudios,
            demands,
            tags
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
        return (          <label className="filter-tags-label">All Studios</label>);
    };

    const getDemandDisplay = () => {
        if (activeFilter && activeFilter.startsWith('d_')) {
            const demand = demands.find(item => `d_${slugify(item)}` === activeFilter);
            return demand || "All Demands";
        }
        return (          <label className="filter-tags-label">All Demands</label>);
    };

    // Selected studio record for description (when a studio filter is active)
    const selectedStudio = useMemo(() => {
        if (!activeFilter || !activeFilter.startsWith('s_')) return null;
        return studiosData.find(studio => `s_${slugify((studio.title || '').trim())}` === activeFilter) || null;
    }, [activeFilter]);

    const FilterDropdown = ({ id, label, displayValue, options, categoryPrefix, getFilterClass, extraContent }) => {
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
                {extraContent}
            </div>
        );
    };

    return(
        <section id="filters" className="filters" ref={filtersRef}>
     <a href="#about">
  <h5>About the Superstudio</h5>
</a>

            <FilterDropdown
                id="studio-filter"
                label="Studio"
                displayValue={getStudioDisplay()}
                options={studios}
                categoryPrefix="s_"
                getFilterClass={(item) => `s_${slugify(item.split(" — ")[0])}`}
                extraContent={selectedStudio && selectedStudio.desc ? (
                    <div className="filter-studio">
                        <div className="filter-studio-school"><label>School:</label> {selectedStudio.school}</div>
                        <div className="filter-studio-teacher"><label>Instructor:</label> {selectedStudio.teacher}</div>
                        <div className="filter-studio-term"><label>Term:</label> {selectedStudio.term}</div>
                        <div className="filter-studio-level"><label>Level:</label> {selectedStudio.level}</div>
                        <div className="filter-studio-description"><label>Description:</label> {parse(selectedStudio.desc)}</div>
                    </div>
                ) : null}
            />
            
            <FilterDropdown
                id="demand-filter"
                label="Demand"
                displayValue={getDemandDisplay()}
                options={demands}
                categoryPrefix="d_"
                getFilterClass={(item) => `d_${slugify(item)}`}
            />
            
            <div className="filter-tags">
                <label className="filter-tags-label">Tags</label>
                <div className="filter-tag-buttons">
                    <button
                        type="button"
                        className={`filter-tag-button ${!(activeFilter && activeFilter.startsWith('t_')) ? 'filter-tag-button--active' : ''}`}
                        onClick={() => {
                            if (activeFilter && activeFilter.startsWith('t_')) {
                                setActiveFilter(null);
                            }
                        }}
                    >
                        All
                    </button>
                    {tags.map((tag, index) => {
                        const filterClass = `t_${slugify(tag)}`;
                        const isActive = activeFilter === filterClass;
                        return (
                            <button
                                key={index}
                                type="button"
                                className={`filter-tag-button ${isActive ? 'filter-tag-button--active' : ''}`}
                                onClick={() => setActiveFilter(filterClass)}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}

export default FiltersList