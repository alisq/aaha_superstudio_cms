import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { slugify } from "../utils/slugify";
import { parseStudentNames, findSubmissionByStudentName } from "../utils/studentNames";
import {
    formatStudioLabel,
    getStudioFilterClass,
    getStudiosWithSubmissions,
    studiosData,
} from "../utils/studios";
import parse from "html-react-parser";
import submissions from '../data/submissionsAll';

function FiltersList({ activeFilter, setActiveFilter }) {
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState(null);
    const [studentAutocompleteOpen, setStudentAutocompleteOpen] = useState(false);
    const [studentQuery, setStudentQuery] = useState("");
    const filtersRef = useRef(null);

    // Extract unique values from submissions
    const { studios, demands, tags, studentNames } = useMemo(() => {
        const demandSet = new Set();
        const tagSet = new Set();
        const studentSet = new Set();

        submissions.forEach(submission => {
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

            parseStudentNames(submission.Student_Names).forEach(name => {
                studentSet.add(name);
            });
        });

        const studios = getStudiosWithSubmissions(submissions).map(formatStudioLabel);

        // Demands and tags: master lists are built from cited values in submissions
        const demands = Array.from(demandSet).sort();
        const tags = Array.from(tagSet).sort();
        const studentNames = Array.from(studentSet).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' })
        );

        return {
            studios,
            demands,
            tags,
            studentNames
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filtersRef.current && !filtersRef.current.contains(event.target)) {
                setOpenDropdown(null);
                setStudentAutocompleteOpen(false);
            }
        };

        if (openDropdown || studentAutocompleteOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdown, studentAutocompleteOpen]);

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
        setStudentAutocompleteOpen(false);
        setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
    };

    const studentSuggestions = useMemo(() => {
        const query = studentQuery.trim().toLowerCase();
        if (!query) return [];
        return studentNames.filter(name => name.toLowerCase().includes(query)).slice(0, 20);
    }, [studentQuery, studentNames]);

    const handleStudentQueryChange = (event) => {
        setStudentQuery(event.target.value);
        setStudentAutocompleteOpen(true);
        setOpenDropdown(null);
    };

    const handleStudentSelect = (name) => {
        setStudentAutocompleteOpen(false);
        setStudentQuery("");

        if (!name) return;

        const submission = findSubmissionByStudentName(submissions, name);
        if (submission) {
            navigate(`/submission/${slugify(submission.Project_Title)}`);
        }
    };

    // Get the current display value for each dropdown
    const getStudioDisplay = () => {
        if (activeFilter && activeFilter.startsWith('s_')) {
            const studio = studios.find(item => getStudioFilterClass(item.split(" — ")[0]) === activeFilter);
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
        return studiosData.find(studio => getStudioFilterClass(studio) === activeFilter) || null;
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
   

            <FilterDropdown
                id="studio-filter"
                label="Studio"
                displayValue={getStudioDisplay()}
                options={studios}
                categoryPrefix="s_"
                getFilterClass={(item) => getStudioFilterClass(item.split(" — ")[0])}
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

            <div className="filter-dropdown filter-student-autocomplete">
                <div className="dropdown-wrapper">
                    <input
                        type="text"
                        className="student-autocomplete-input"
                        placeholder="All Students"
                        value={studentQuery}
                        onChange={handleStudentQueryChange}
                        onFocus={() => {
                            setStudentAutocompleteOpen(true);
                            setOpenDropdown(null);
                        }}
                        aria-haspopup="listbox"
                        aria-label="Filter by student name"
                    />
                    <div className={`dropdown-menu ${studentAutocompleteOpen && studentSuggestions.length > 0 ? 'open' : ''}`}>
                        {studentSuggestions.map((name, index) => {
                            const delay = (index + 1) * 0.02;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    className={`dropdown-option ${studentAutocompleteOpen ? 'rolling-down' : 'rolling-up'}`}
                                    style={{ animationDelay: `${delay}s` }}
                                    onClick={() => handleStudentSelect(name)}
                                >
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            
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
              <a href="#about">
  <h5>About the Superstudio</h5>
</a>
        </section>
    )
}

export default FiltersList