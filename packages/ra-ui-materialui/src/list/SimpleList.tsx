import * as React from 'react';
import { FC, ReactNode, ReactElement } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    List,
    ListProps,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import {
    linkToRecord,
    sanitizeListRestProps,
    useListContext,
    Record,
    Identifier,
} from 'ra-core';

import SimpleListLoading from './SimpleListLoading';
import { ClassesOverride } from '../types';

const useStyles = makeStyles(
    {
        tertiary: { float: 'right', opacity: 0.541176 },
    },
    { name: 'RaSimpleList' }
);

/**
 * The <SimpleList> component renders a list of records as a material-ui <List>.
 * It is usually used as a child of react-admin's <List> and <ReferenceManyField> components.
 *
 * Also widely used on Mobile.
 *
 * Props:
 * - primaryText: function returning a React element (or some text) based on the record
 * - secondaryText: same
 * - tertiaryText: same
 * - leftAvatar: function returning a React element based on the record
 * - leftIcon: same
 * - rightAvatar: same
 * - rightIcon: same
 * - linkType: 'edit' or 'show', or a function returning 'edit' or 'show' based on the record
 * - rowStyle: function returning a style object based on (record, index)
 *
 * @example // Display all posts as a List
 * const postRowStyle = (record, index) => ({
 *     backgroundColor: record.views >= 500 ? '#efe' : 'white',
 * });
 * export const PostList = (props) => (
 *     <List {...props}>
 *         <SimpleList
 *             primaryText={record => record.title}
 *             secondaryText={record => `${record.views} views`}
 *             tertiaryText={record =>
 *                 new Date(record.published_at).toLocaleDateString()
 *             }
 *             rowStyle={postRowStyle}
 *          />
 *     </List>
 * );
 */
const SimpleList: FC<SimpleListProps> = props => {
    const {
        className,
        classes: classesOverride,
        hasBulkActions,
        leftAvatar,
        leftIcon,
        linkType = 'edit',
        primaryText,
        rightAvatar,
        rightIcon,
        secondaryText,
        tertiaryText,
        rowStyle,
        ...rest
    } = props;
    const { basePath, data, ids, loaded, total } = useListContext(props);
    const classes = useStyles(props);

    if (loaded === false) {
        return (
            <SimpleListLoading
                classes={classes}
                className={className}
                hasLeftAvatarOrIcon={!!leftIcon || !!leftAvatar}
                hasRightAvatarOrIcon={!!rightIcon || !!rightAvatar}
                hasSecondaryText={!!secondaryText}
                hasTertiaryText={!!tertiaryText}
            />
        );
    }

    return (
        total > 0 && (
            <List className={className} {...sanitizeListRestProps(rest)}>
                {ids.map((id, rowIndex) => (
                    <LinkOrNot
                        linkType={linkType}
                        basePath={basePath}
                        id={id}
                        key={id}
                        record={data[id]}
                    >
                        <ListItem
                            button={!!linkType as any}
                            style={
                                rowStyle
                                    ? rowStyle(data[id], rowIndex)
                                    : undefined
                            }
                        >
                            {leftIcon && (
                                <ListItemIcon>
                                    {leftIcon(data[id], id)}
                                </ListItemIcon>
                            )}
                            {leftAvatar && (
                                <ListItemAvatar>
                                    <Avatar>{leftAvatar(data[id], id)}</Avatar>
                                </ListItemAvatar>
                            )}
                            <ListItemText
                                primary={
                                    <div>
                                        {primaryText(data[id], id)}
                                        {tertiaryText && (
                                            <span className={classes.tertiary}>
                                                {tertiaryText(data[id], id)}
                                            </span>
                                        )}
                                    </div>
                                }
                                secondary={
                                    secondaryText && secondaryText(data[id], id)
                                }
                            />
                            {(rightAvatar || rightIcon) && (
                                <ListItemSecondaryAction>
                                    {rightAvatar && (
                                        <Avatar>
                                            {rightAvatar(data[id], id)}
                                        </Avatar>
                                    )}
                                    {rightIcon && (
                                        <ListItemIcon>
                                            {rightIcon(data[id], id)}
                                        </ListItemIcon>
                                    )}
                                </ListItemSecondaryAction>
                            )}
                        </ListItem>
                    </LinkOrNot>
                ))}
            </List>
        )
    );
};

SimpleList.propTypes = {
    className: PropTypes.string,
    classes: PropTypes.object,
    leftAvatar: PropTypes.func,
    leftIcon: PropTypes.func,
    linkType: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
        PropTypes.func,
    ]),
    primaryText: PropTypes.func,
    rightAvatar: PropTypes.func,
    rightIcon: PropTypes.func,
    secondaryText: PropTypes.func,
    tertiaryText: PropTypes.func,
    rowStyle: PropTypes.func,
};

export type FunctionToElement = (
    record: Record,
    id: Identifier
) => ReactElement | string;

export interface SimpleListProps extends Omit<ListProps, 'classes'> {
    className?: string;
    classes?: ClassesOverride<typeof useStyles>;
    hasBulkActions?: boolean;
    leftAvatar?: FunctionToElement;
    leftIcon?: FunctionToElement;
    primaryText?: FunctionToElement;
    linkType?: string | FunctionLinkType | boolean;
    rightAvatar?: FunctionToElement;
    rightIcon?: FunctionToElement;
    secondaryText?: FunctionToElement;
    tertiaryText?: FunctionToElement;
    rowStyle?: (record: Record, index: number) => any;
}

const useLinkOrNotStyles = makeStyles(
    {
        link: {
            textDecoration: 'none',
            color: 'inherit',
        },
    },
    { name: 'RaLinkOrNot' }
);

const LinkOrNot: FC<LinkOrNotProps> = ({
    classes: classesOverride,
    linkType,
    basePath,
    id,
    children,
    record,
}) => {
    const classes = useLinkOrNotStyles({ classes: classesOverride });
    const link =
        typeof linkType === 'function' ? linkType(record, id) : linkType;

    return link === 'edit' || link === true ? (
        <Link to={linkToRecord(basePath, id)} className={classes.link}>
            {children}
        </Link>
    ) : link === 'show' ? (
        <Link
            to={`${linkToRecord(basePath, id)}/show`}
            className={classes.link}
        >
            {children}
        </Link>
    ) : (
        <span>{children}</span>
    );
};

export type FunctionLinkType = (record: Record, id: Identifier) => string;

export interface LinkOrNotProps {
    classes?: ClassesOverride<typeof useLinkOrNotStyles>;
    linkType?: string | FunctionLinkType | boolean;
    basePath: string;
    id: Identifier;
    record: Record;
    children: ReactNode;
}

export default SimpleList;
