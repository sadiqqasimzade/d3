import * as d3 from "d3"
import { useFetchCountryScoreYearQuery } from "src/store/reducers/apiSlice"
import ChartCard from "../chartCard"
import { getCountry } from "src/store/selectors/appSelectors"
import { useSelector } from "react-redux"
import { useEffect, useRef } from "react"

type Props = {
    text_color: string
}
export default function ChangeInRankAmongYears({ text_color }: Props) {

    const country = useSelector(getCountry)
    const { data, isLoading, error } = useFetchCountryScoreYearQuery({ country })
    const svgRef = useRef(null)


    useEffect(() => {
        if (data && data?.length > 0) {
            // Set the dimensions and margins of the graph
            const margin = { top: 10, right: 30, bottom: 30, left: 60 },
                width = 460 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;
            d3.select(svgRef.current).selectAll("*").remove()
            const svg = d3
                .select(svgRef.current)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            const x = d3
                .scaleTime()
                .domain(d3.extent(data, (d) => d3.timeParse("%Y")(d.year)))
                .range([0, width]);


            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .attr('stroke-opacity', 0);;

            const y = d3
                .scaleLinear()
                .domain([0, 100])
                .range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(y))
                .attr('stroke-opacity', 0);;

            svg
                .append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2.5)
                .attr("d", d3.line()
                    .x((d) => x(d3.timeParse("%Y")(d.year)))
                    .y((d) => y(d.average_score))
                );


            const make_x_gridlines = d3.axisBottom(x)
                .tickSize(-height)
                .tickFormat("");

            const make_y_gridlines = d3.axisLeft(y)
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
        }
    }, [data])
    return (
        <ChartCard title="Change in Rank Among Years" text_color={text_color}>
            {(!country) ?
                <p>Please select a country</p> :
                isLoading ? <p>Loading</p> :
                    error ? <p>Error</p> :

                        <div ref={svgRef}></div>
            }

        </ChartCard>)
}