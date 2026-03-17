import { Component, toChildArray, VNode } from "preact";
import * as css from "./pktabs.module.css";

type PkTabProps = {title: string};

export class PkTab extends Component<PkTabProps> {

    render() {
        return this.props.children
    }
}

type PkTabListProps = {
    tabs: Array<PkTabProps | null>,
    selectedIndex: number,
    onTabSelected: (newIndex: number) => void
};

class PkTabList extends Component<PkTabListProps> {

    render() {

        return <div role="tablist">
            {
                this.props.tabs.map((tab, index) => {
                    const selected = this.props.selectedIndex === index;

                    const onClick = () => {
                        this.props.onTabSelected(index);
                    };

                    return <button role="tab" aria-selected={selected} onClick={onClick}>
                        {tab ? tab.title : "Unnamed Tab"}
                        </button>;
                })
            }
        </div>
    }
}

class PkTabPanel extends Component<{visible: Boolean}> {

    constructor() {
        super();
    }

    render() {
        return <div role="tabpanel" aria-hidden={!this.props.visible}>
            {this.props.children}
        </div>
    }
}

type PkTabsProps = {
    selectedIndex?: number
    onIndexChanged?: (newIndex: number) => void
}

type PkTabsState = {
    selectedIndex: number
}

export class PkTabs extends Component<PkTabsProps, PkTabsState> {
    
    constructor(props: PkTabsProps) {
        super(props);

        const selectedIndex = this.props.selectedIndex !== undefined
            ? this.props.selectedIndex : 0;

        this.state = {selectedIndex}
    }

    onTabSelected(newIndex: number) {
        this.setState({selectedIndex: newIndex});
    }

    render() {

        const in_children = toChildArray(this.props.children);

        let out_children = []
        let out_tabs: Array<PkTabProps | null> = []
        for (let idx = 0; idx < in_children.length; idx++) {

            const child = in_children[idx];
            const childNode = child as VNode<PkTabProps>;
            if (childNode) {
                out_tabs.push(childNode.props);

                out_children.push(
                    <PkTabPanel visible={idx == this.state.selectedIndex}>
                        {child}
                    </PkTabPanel>
                )
            }
        }

        return <div className={css.pktabs}>
            <PkTabList 
                tabs={out_tabs}
                selectedIndex={this.state.selectedIndex}
                onTabSelected={this.onTabSelected.bind(this)}
                />
            {out_children}
        </div>
    }
}