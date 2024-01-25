import React from "react"

const PageButton = props => { 
    return (
        <a href={props.link} target="blank">
            <div className="btn">
                <span  className={props.isBold ? "pageButtonBold" : "hoverBold"}>
                    {props.name}
                </span>
            </div>
        </a>
    )
}

export default PageButton