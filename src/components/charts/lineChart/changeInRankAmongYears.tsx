import * as d3 from "d3"
import { useFetchCountryScoreYearQuery } from "src/store/reducers/apiSlice"
import ChartCard from "../chartCard"
import { getCountry, getTableMode } from "src/store/selectors/appSelectors"
import { useSelector } from "react-redux"
import { useEffect, useRef } from "react"
import Table from "../table"
import { SerializedError } from "@reduxjs/toolkit"

type Props = {
    text_color: string
}
export default function ChangeInRankAmongYears({ text_color }: Props) {

    const country = useSelector(getCountry)
    const { data, isLoading, error } = useFetchCountryScoreYearQuery({ country })
    const svgRef = useRef(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const tableMode = useSelector(getTableMode)
    useEffect(() => {
        if (data && data?.length > 0 && tableMode === false) {
            // Set the dimensions and margins of the graph
            const margin = { top: 10, right: 20, bottom: 30, left: 30 },
                width = 420 - margin.left - margin.right,
                height = 150 - margin.top - margin.bottom;
            d3.select(svgRef.current).selectAll("*").remove()
            //Svg element
            const svg = d3
                .select(svgRef.current)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            //Scale
            const xScale = d3
                .scaleTime()
                .domain(d3.extent(data, d => d3.timeParse("%Y")(d.year)))
                .range([0, width]);
            const yScale = d3
                .scaleLinear()
                .domain([0, d3.max(data, d => d.average_score)])
                .range([height, 0]);


            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale))
                .attr('stroke-opacity', 0);;


            svg.append("g")
                .call(d3.axisLeft(yScale).ticks(5))
                .attr('stroke-opacity', 0);;

            svg
                .append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 2.5)
                .attr("d", d3.line()
                    .x(d => xScale(d3.timeParse("%Y")(d.year)))
                    .y(d => yScale(d.average_score))
                );

            const make_x_gridlines = d3.axisBottom(xScale)
                .tickSize(-height)
                .tickFormat("");

            const make_y_gridlines = d3.axisLeft(yScale)
                .tickSize(-(width))
                .tickFormat("")

            svg.append("g")
                .attr('id', 'gridXLabel')
                .attr("transform", `translate(0,${height})`)
                .style("opacity", "0.1")
                .call(make_x_gridlines)

            svg.append("g")
                .attr('id', 'gridYLabel')
                .attr("transform", `translate(${0},0)`)
                .style("opacity", "0.1")
                .call(make_y_gridlines)


            //create dots
            // Add data points as circles and attach event listeners for tooltips
            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d3.timeParse("%Y")(d.year)))
                .attr("cy", d => yScale(d.average_score))
                .attr("r", 5).style('opacity', '0')
                .attr("fill", "steelblue")
                .on("mouseover", (event, d) => {
                    // Show the tooltip on mouseover
                    const tooltip = tooltipRef.current as HTMLDivElement
                    event.target.style = 'opacity:1'
                    tooltip.style.display = "block";
                    tooltip.style.left = event.target.cx.baseVal.value + "px";
                    tooltip.style.top = event.target.cy.baseVal.value + 30 + "px";
                    tooltip.textContent = `Date: ${d.year} Value: ${d.average_score}`;
                })
                .on("mouseout", (event) => {
                    // Hide the tooltip on mouseout
                    event.target.style = 'opacity:0'

                    const tooltip = tooltipRef.current as HTMLDivElement
                    tooltip.style.display = "none";
                });
        }
    }, [data, tableMode])
    return (
        <ChartCard title="Change in Rank Among Years" text_color={text_color}>
            {isLoading ? <p>Loading</p> :
                error ? <p>{(error as SerializedError).message}</p> :
                    data &&

                    <div className="relative flex justify-center flex-col h-full">
                        <div className={`${tableMode ? 'block' : 'hidden'}`}>
                            <Table data={[data]} x_key="year" y_key="average_score" x_title="Year" y_title="Rank" />
                        </div>

                        <div className={`${tableMode ? 'hidden' : 'block'}`}>
                            <div ref={tooltipRef} className=" hidden absolute pointer-events-none w-28 border-gray-700 dark:bg-chartCardHeader border-2 h-16 p-2 text-sm bg-gray-100 rounded-2xl"></div>
                            <div ref={svgRef}></div>
                        </div>
                    </div>
            }
        </ChartCard>)
}