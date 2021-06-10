import { faAngleDown, faSearch, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICellRendererParams, IFloatingFilterParams } from 'ag-grid-community';
import debounce from 'lodash.debounce';
import * as React from 'react';

type CellRendererProps = ICellRendererParams & {
    filterModel: Map<string, string>
}

type SearchFilterRendererProps = IFloatingFilterParams & {
    onFilterChange: (colName: string, filterValue: string) => void;
    onclickNext: () => void;
    colName: string;
}

type SearchFilterRendererState = {
    hasHovered: boolean;
    hasClicked: boolean;
}

export class LoadingRenderer extends React.Component<ICellRendererParams> {
    render(): JSX.Element {
        return <React.Fragment>
            {this.props.value ? this.props.value : <FontAwesomeIcon icon={faSpinner} />}
        </React.Fragment>
    }
}

export class CellRenderer extends React.Component<CellRendererProps> {
    render(): JSX.Element {
        if (this.props.value === undefined) {
            return <React.Fragment><FontAwesomeIcon icon={faSpinner} /></React.Fragment>;
        }
        const currField = this.props.colDef?.field;
        const currFieldVal = this.props.value || '';
        const isMatched = this.props.data && this.props.data['isMatched'];
        let cellElement: JSX.Element;
        const searchTerm = (currField && this.props.filterModel.get(currField)) || '';
        if (this.props.filterModel.size > 0) {
            if (isMatched) {
                if (searchTerm) {
                    const highlightedElement = <span style={{ backgroundColor: '#cccc00' }}>{searchTerm}</span>;
                    const remElement = <span>{currFieldVal.slice(searchTerm.length-1)}</span>;
                    cellElement = <span>{highlightedElement}{remElement}</span>;
                } else {
                    cellElement = <span> {currFieldVal} </span>;
                }
            }
            else {
                cellElement = <span style={{ color: '#808080' }}> {currFieldVal} </span>;
            }
        } else {
            cellElement = <>{currFieldVal || ''}</>;
        }

        return <React.Fragment>
            {cellElement}
        </React.Fragment>
    }
}

export class SearchFilterRenderer extends React.Component<SearchFilterRendererProps, SearchFilterRendererState> {

    private inputComponent: HTMLInputElement | null;
    private debouncedChangeHandler: any;

    constructor(props: SearchFilterRendererProps) {
        super(props);
        this.inputComponent = null;
        this.state = {
            hasHovered: false,
            hasClicked: false
        }

        this.debouncedChangeHandler = debounce((colName, inputVal) => {
            this.props.onFilterChange(colName, inputVal)
        }, 500);

        this.onInputBoxChanged = this.onInputBoxChanged.bind(this);
        this.onMouseEnterHandler = this.onMouseEnterHandler.bind(this);
        this.onMouseLeaveHandler = this.onMouseLeaveHandler.bind(this);
        this.onClickHandler = this.onClickHandler.bind(this);
        this.onDownClickHandler = this.onDownClickHandler.bind(this);
        this.onCloseClickHandler = this.onCloseClickHandler.bind(this);
        this.onKeyDownEvent = this.onKeyDownEvent.bind(this);

    }

    render(): JSX.Element {
        return (
            <div onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler} onClick={this.onClickHandler}>
                {!this.state.hasClicked && !this.state.hasHovered &&
                    <FontAwesomeIcon style={{ marginLeft: '10px' }} icon={faSearch} />}
                {!this.state.hasClicked && this.state.hasHovered &&
                    <div style={{ cursor: 'pointer' }}>
                        <FontAwesomeIcon style={{ marginLeft: '10px' }} icon={faSearch} />
                        <span style={{ marginLeft: "10px", fontSize: '13px', width: '50px', overflow: 'hidden', textOverflow: 'ellipsis' }} className="searchLabel">Search</span>
                    </div>}
                {this.state.hasClicked &&
                    <div>
                        <input type="search" ref={(input) => this.inputComponent = input} onKeyDown={this.onKeyDownEvent} onInput={this.onInputBoxChanged} style={{ width: '50%', margin: '10px' }} />
                        <FontAwesomeIcon className="hoverClass" icon={faTimes} style={{ marginTop: '20px' }} onClick={this.onCloseClickHandler} />
                        <FontAwesomeIcon className="hoverClass" icon={faAngleDown} style={{ marginLeft: '10px', marginTop: '20px' }} onClick={this.onDownClickHandler} />
                    </div>}
            </div>
        );
    }

    private onKeyDownEvent(event: React.KeyboardEvent) {
        if (event.key === 'Enter') {
            this.props.onclickNext();
        }
    }

    private onInputBoxChanged(event: React.ChangeEvent<HTMLInputElement>) {
        if (this.inputComponent) {
            this.inputComponent.focus();
        }
        this.debouncedChangeHandler(this.props.colName, event.target.value);
        return;
    }

    private onMouseEnterHandler(event: React.MouseEvent) {
        this.setState({
            hasHovered: true
        });
        return;
    }

    private onMouseLeaveHandler(event: React.MouseEvent) {
        this.setState({
            hasHovered: false
        });
        return;
    }

    private onClickHandler(event: React.MouseEvent) {
        this.setState({
            hasClicked: true
        });
        return;
    }

    private onDownClickHandler(event: React.MouseEvent) {
        this.props.onclickNext();
        return;
    }

    private onCloseClickHandler(event: React.MouseEvent) {
        this.setState({
            hasClicked: false
        });
        this.props.onFilterChange(this.props.colName, '');
        event.stopPropagation();
        return;
    }
}