import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Typography} from '@material-ui/core';
import {DocGrey} from './DocConstants';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {secondary} from '../../theme';
import ReactJson from 'react-json-view';

const styles = theme => ({
  container: {
    borderRadius: 9,
    backgroundColor: '#4f5568',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#3d4256',
    padding: 4,
    paddingLeft: 10,
    display: 'flex',
    flexDirection: 'row',
    cursor: 'default'
  },
  headingText: {
    fontSize: 12,
    color: DocGrey,
    fontWeight: 500,
  },
  content: {
    padding: 10,
    paddingTop: 15,
  },
  contentType: {
    marginBottom: 12,
    fontSize: 13,
    color: DocGrey,
    fontWeight: 500
  }
});

class _DocCodeBox extends React.Component {
  render() {
    const {classes, children, title, rightRegion} = this.props;
    return (
      <div className={classes.container}>
        <div className={classes.header}>
          <Typography variant="overline" className={classes.headingText}>{title}</Typography>
          <div style={{flex: 1}}/>
          {rightRegion}
        </div>
        <div className={classes.content}>
          {children}
        </div>
      </div>
    );
  }
}

export const DocCodeBox = withStyles(styles)(_DocCodeBox);

export const EndpointOverviewCodeBox = ({method, url}) => (
  <DocCodeBox title="Endpoint">
    <Typography variant="body" component="span" style={{fontWeight: 600, color: '#52e2a3'}}>{method}</Typography>
    <Typography variant="body" component="span" style={{marginLeft: 9, color: DocGrey}}>{url}</Typography>
  </DocCodeBox>
);

export const ExampleShapeViewer = withStyles(styles)(({shapeId, classes, example, title, contentType}) => {

  const [showExample, setShowExample] = useState(true);

  const rightRegion = (
    <StyledTabs value={showExample ? 0 : 1}>
      <StyledTab label="Example" onClick={() => setShowExample(true)}/>
      <StyledTab label="Schema" onClick={() => setShowExample(false)}/>
    </StyledTabs>
  );

  const exampleRender = (() => {
    return (
      <>
        {contentType && <Typography variant="subtitle1" className={classes.contentType}>{contentType}</Typography>}

        {(typeof example === 'string' || typeof example === 'number' || typeof example === 'boolean') ?
          <pre>{JSON.stringify(example)}</pre> : (
          <div>
          <ReactJson
          src={example}
          theme="monokai"
          style={{backgroundColor: 'transparent'}}
          enableClipboard={false}
          name={false}
          displayDataTypes={false}
          />
          </div>
          )}
      </>
    );
  })();

  return (
    <DocCodeBox title={title} rightRegion={rightRegion}>
      {showExample ? exampleRender : <div>RENDER THE SHAPE HERE</div>}
    </DocCodeBox>
  );
});

/* Custom Tabs */
const StyledTabs = withStyles({
  root: {
    height: 29,
    minHeight: 'inherit'
  },
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > div': {
      width: '100%',
      backgroundColor: secondary,
    },
  },
})(props => <Tabs {...props} TabIndicatorProps={{children: <div/>}}/>);

const StyledTab = withStyles(theme => ({
  root: {
    textTransform: 'none',
    color: '#fff',
    padding: 0,
    marginTop: 5,
    height: 25,
    minHeight: 'inherit',
    minWidth: 'inherit',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(12),
    marginRight: theme.spacing(2),
    '&:focus': {
      opacity: 1,
    },
  },
}))(props => <Tab disableRipple {...props} />);