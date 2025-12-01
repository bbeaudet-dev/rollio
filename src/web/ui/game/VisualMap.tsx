import React, { useMemo } from 'react';
import { GameMap, MapNode } from '../../../game/logic/mapGeneration';
import { getAvailableWorldChoices, getWorldIdForNode } from '../../../game/logic/mapGeneration';
import { WORLD_POOL } from '../../../game/data/worlds';

interface VisualMapProps {
  gameMap: GameMap;
  onSelectNode: (nodeId: number) => void;
  onReturnToMenu?: () => void;
}

interface NodePosition {
  node: MapNode;
  x: number;
  y: number;
}

export const VisualMap: React.FC<VisualMapProps> = ({ gameMap, onSelectNode, onReturnToMenu }) => {
  // Get available nodes - handle case where currentNode might not be set
  // If no currentNode, show all nodes in column 1 (world 1 options)
  let availableNodeIds: number[];
  if (gameMap.currentNode === undefined || gameMap.currentNode === null) {
    // No current node - show world 1 options (column 1)
    const world1Nodes = gameMap.nodes.filter(n => n.column === 1 && n.worldNumber === 1);
    availableNodeIds = world1Nodes.map(n => n.nodeId);
  } else {
    availableNodeIds = getAvailableWorldChoices(gameMap);
  }
  
  // Calculate positions for nodes
  const nodePositions = useMemo(() => {
    const positions: NodePosition[] = [];
    const columnWidth = 200;
    const rowHeight = 120;
    const startX = 100;
    const baseY = 200; // Base Y position for centering
    
    // Group nodes by column
    const nodesByColumn = new Map<number, MapNode[]>();
    gameMap.nodes.forEach(node => {
      if (!nodesByColumn.has(node.column)) {
        nodesByColumn.set(node.column, []);
      }
      nodesByColumn.get(node.column)!.push(node);
    });
    
    // Find the maximum number of nodes in any column for centering
    const maxNodesInColumn = Math.max(...Array.from(nodesByColumn.values()).map(nodes => nodes.length));
    const maxTotalHeight = (maxNodesInColumn - 1) * rowHeight;
    
    // Calculate positions for each column
    nodesByColumn.forEach((nodes, column) => {
      const sortedNodes = [...nodes].sort((a, b) => a.row - b.row);
      const totalHeight = (sortedNodes.length - 1) * rowHeight;
      // Center each column vertically based on the tallest column
      const columnStartY = baseY - maxTotalHeight / 2 + (maxTotalHeight - totalHeight) / 2;
      
      sortedNodes.forEach((node, index) => {
        positions.push({
          node,
          x: startX + column * columnWidth,
          y: columnStartY + index * rowHeight,
        });
      });
    });
    
    return positions;
  }, [gameMap.nodes]);
  
  // Get node position by nodeId
  const getNodePosition = (nodeId: number): NodePosition | undefined => {
    return nodePositions.find(p => p.node.nodeId === nodeId);
  };
  
  // Check if node is visited
  const isNodeVisited = (nodeId: number): boolean => {
    return gameMap.playerPath.includes(nodeId);
  };
  
  // Check if node is current
  const isNodeCurrent = (nodeId: number): boolean => {
    return gameMap.currentNode === nodeId;
  };
  
  // Check if node is available
  const isNodeAvailable = (nodeId: number): boolean => {
    return availableNodeIds.includes(nodeId);
  };
  
  // Get world color based on worldId
  const getWorldColor = (worldId: string): string => {
    const world = WORLD_POOL.find(w => w.id === worldId);
    if (!world) return '#666';
    
    // Color scheme based on world type
    const colorMap: Record<string, string> = {
      'base': '#888',
      'mountainous': '#8B4513',
      'plains': '#90EE90',
      'city': '#FFD700',
      'desert': '#F4A460',
      'windy': '#87CEEB',
      'barren': '#696969',
      'bountiful': '#FF69B4',
    };
    
    return colorMap[worldId] || '#666';
  };
  
  // Check if two line segments intersect
  const doLinesIntersect = (
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
  ): boolean => {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 0.001) return false; // Parallel lines
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    return t > 0 && t < 1 && u > 0 && u < 1;
  };

  // Calculate curved path to avoid crossings
  const calculateCurvedPath = (
    fromPos: NodePosition,
    toPos: NodePosition,
    existingPaths: Array<{ from: NodePosition; to: NodePosition; offset: number }>,
    connectionKey: string
  ): { path: string; pathLength: number; offset: number } => {
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 0.001) {
      return { path: `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`, pathLength: 0, offset: 0 };
    }
    
    // Calculate perpendicular vector
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    // Check for intersections with existing paths
    let offset = 0;
    let bestOffset = 0;
    let minIntersections = Infinity;
    const maxOffset = 50;
    const offsetStep = 8;
    
    // Try different offsets and pick the one with fewest intersections
    for (let testOffset = -maxOffset; testOffset <= maxOffset; testOffset += offsetStep) {
      const controlX = fromPos.x + dx * 0.5 + perpX * testOffset;
      const controlY = fromPos.y + dy * 0.5 + perpY * testOffset;
      
      let intersections = 0;
      
      // Check intersections with existing paths
      for (const existing of existingPaths) {
        // Skip if same connection
        if (existing.from.node.nodeId === fromPos.node.nodeId && 
            existing.to.node.nodeId === toPos.node.nodeId) continue;
        
        const existingDx = existing.to.x - existing.from.x;
        const existingDy = existing.to.y - existing.from.y;
        const existingDist = Math.sqrt(existingDx * existingDx + existingDy * existingDy);
        
        if (existingDist < 0.001) continue;
        
        const existingPerpX = -existingDy / existingDist;
        const existingPerpY = existingDx / existingDist;
        const existingControlX = existing.from.x + existingDx * 0.5 + existingPerpX * existing.offset;
        const existingControlY = existing.from.y + existingDy * 0.5 + existingPerpY * existing.offset;
        
        // Check if control points are too close (would cause visual overlap)
        const controlDist = Math.sqrt(
          Math.pow(controlX - existingControlX, 2) + 
          Math.pow(controlY - existingControlY, 2)
        );
        
        if (controlDist < 30) {
          intersections++;
        }
        
        // Check for line segment intersections (approximate)
        if (doLinesIntersect(
          fromPos.x, fromPos.y, controlX, controlY,
          existing.from.x, existing.from.y, existingControlX, existingControlY
        ) || doLinesIntersect(
          controlX, controlY, toPos.x, toPos.y,
          existingControlX, existingControlY, existing.to.x, existing.to.y
        )) {
          intersections += 2;
        }
      }
      
      if (intersections < minIntersections) {
        minIntersections = intersections;
        bestOffset = testOffset;
      }
    }
    
    offset = bestOffset;
    
    // Use quadratic bezier curve
    const controlX = fromPos.x + dx * 0.5 + perpX * offset;
    const controlY = fromPos.y + dy * 0.5 + perpY * offset;
    
    // Better approximation for bezier curve length
    const pathLength = distance * (1 + Math.abs(offset) / distance * 0.3);
    
    const path = `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`;
    
    return { path, pathLength, offset };
  };

  // Render connection lines - show ALL connections, gray out inaccessible ones
  const renderConnections = () => {
    const lines: React.ReactElement[] = [];
    const arrows: React.ReactElement[] = [];
    const renderedConnections = new Set<string>();
    const pathData: Array<{ from: NodePosition; to: NodePosition; offset: number; key: string }> = [];
    
    // First pass: collect all paths and calculate offsets
    gameMap.connections.forEach((connectedNodeIds, fromNodeId) => {
      const fromPos = getNodePosition(fromNodeId);
      if (!fromPos) return;
      
      connectedNodeIds.forEach(toNodeId => {
        const toPos = getNodePosition(toNodeId);
        if (!toPos) return;
        
        const connectionKey = `${Math.min(fromNodeId, toNodeId)}-${Math.max(fromNodeId, toNodeId)}`;
        if (renderedConnections.has(connectionKey)) return;
        renderedConnections.add(connectionKey);
        
        const { offset } = calculateCurvedPath(fromPos, toPos, pathData, connectionKey);
        pathData.push({ from: fromPos, to: toPos, offset, key: connectionKey });
      });
    });
    
    // Second pass: render paths
    pathData.forEach(({ from: fromPos, to: toPos, offset, key: connectionKey }) => {
      const fromNodeId = fromPos.node.nodeId;
      const toNodeId = toPos.node.nodeId;
      
      // Determine connection style
      const fromVisited = isNodeVisited(fromNodeId);
      const toVisited = isNodeVisited(toNodeId);
      const isFromCurrent = isNodeCurrent(fromNodeId);
      
      // Check if this specific connection is available (must be from current node AND destination must be available)
      const toAvailable = isNodeAvailable(toNodeId);
      const isAvailableConnection = isFromCurrent && toAvailable;
      
      // Calculate distance for path
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate curved path
      const perpX = -dy / distance;
      const perpY = dx / distance;
      const controlX = fromPos.x + dx * 0.5 + perpX * offset;
      const controlY = fromPos.y + dy * 0.5 + perpY * offset;
      const curvedPath = `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`;
      const pathLength = distance * 1.2; // Approximation for bezier curve
      
      // Determine line style
      let strokeColor = '#555';
      let strokeWidth = 1;
      let strokeDasharray = '5,5';
      let opacity = 0.2;
      
      if (fromVisited && toVisited) {
        // Both visited - solid blue line
        strokeColor = '#2196F3';
        strokeWidth = 2;
        strokeDasharray = '0';
        opacity = 0.6;
      } else if (isAvailableConnection) {
        // From current to available - solid green line (active path)
        strokeColor = '#4CAF50';
        strokeWidth = 3;
        strokeDasharray = '0';
        opacity = 0.9;
      } else {
        // Unreachable path - grayed out (more visible)
        strokeColor = '#999';
        strokeWidth = 1.5;
        strokeDasharray = '5,5';
        opacity = 0.5;
      }
      
      // Render curved path
      lines.push(
        <path
          key={connectionKey}
          d={curvedPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          opacity={opacity}
        />
      );
      
      // Add animated dash for accessible paths from current position (no arrow head)
      if (isAvailableConnection) {
        const dashLength = 20;
        const gapLength = Math.max(pathLength - dashLength, pathLength * 0.7);
        const totalPatternLength = dashLength + gapLength;
        
        arrows.push(
          <path
            key={`arrow-${connectionKey}`}
            d={curvedPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth + 1}
            opacity={opacity * 1.1}
            strokeDasharray={`${dashLength} ${gapLength}`}
          >
            <animate
              attributeName="stroke-dashoffset"
              from={`${totalPatternLength}`}
              to={`0`}
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        );
      }
    });
    
    return { lines, arrows };
  };
  
  const { lines, arrows } = renderConnections();
  
  // Calculate SVG dimensions
  const maxX = nodePositions.length > 0 ? Math.max(...nodePositions.map(p => p.x)) + 100 : 800;
  const maxY = nodePositions.length > 0 ? Math.max(...nodePositions.map(p => p.y)) + 100 : 600;
  const minY = nodePositions.length > 0 ? Math.min(...nodePositions.map(p => p.y)) - 100 : 0;
  const svgHeight = nodePositions.length > 0 ? maxY - minY + 200 : 600;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      color: '#212529',
      position: 'relative'
    }}>
      {/* Main Menu Button - Top Left */}
      {onReturnToMenu && (
        <button
          onClick={onReturnToMenu}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: '#6c757d',
            color: 'white',
            border: '2px solid black',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5a6268';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d';
          }}
        >
          Main Menu
        </button>
      )}
      <h1 style={{ 
        marginBottom: '20px', 
        fontSize: '32px',
        textAlign: 'center',
        color: '#212529',
        fontWeight: 'bold',
      }}>
        World Map
      </h1>
      
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #dee2e6',
        overflow: 'auto',
        maxWidth: '100%',
      }}>
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${Math.max(800, maxX)} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            maxWidth: '100%',
          }}
        >
          <defs>
            {/* Glow filter for available nodes */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Shadow filter */}
            <filter id="shadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.5"/>
            </filter>
          </defs>
          
          {/* Render connection lines first (behind nodes) */}
          {lines}
          
          {/* Render animated arrows on accessible paths */}
          {arrows}
          
          {/* Render nodes */}
          {nodePositions.map(({ node, x, y }) => {
            const isVisited = isNodeVisited(node.nodeId);
            const isCurrent = isNodeCurrent(node.nodeId);
            const isAvailable = isNodeAvailable(node.nodeId);
            const worldId = getWorldIdForNode(gameMap, node.nodeId);
            const world = WORLD_POOL.find(w => w.id === worldId);
            const worldColor = getWorldColor(worldId || '');
            
            // Base node size - will be animated for current node
            const baseRadius = isAvailable ? 18 : isVisited ? 16 : 14;
            const nodeOpacity = isAvailable ? 1 : isVisited ? 0.7 : 0.4;
            const strokeWidth = isCurrent ? 4 : isAvailable ? 3 : 2;
            const strokeColor = isCurrent ? '#FFD700' : isAvailable ? '#4CAF50' : isVisited ? '#2196F3' : '#666';
            
            return (
              <g key={node.nodeId}>
                {/* Node circle with pulsing animation for current node */}
                <circle
                  cx={x}
                  cy={y}
                  r={baseRadius}
                  fill={worldColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={nodeOpacity}
                  filter={isAvailable ? 'url(#glow)' : isCurrent ? 'url(#shadow)' : undefined}
                  style={{
                    cursor: isAvailable ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (isAvailable) {
                      onSelectNode(node.nodeId);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (isAvailable && !isCurrent) {
                      e.currentTarget.setAttribute('r', String(baseRadius + 2));
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isAvailable && !isCurrent) {
                      e.currentTarget.setAttribute('r', String(baseRadius));
                    }
                  }}
                >
                  {isCurrent && (
                    <animate
                      attributeName="r"
                      values={`${baseRadius};${baseRadius * 1.3};${baseRadius}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                
                {/* World name label */}
                {world && (
                  <text
                    x={x}
                    y={y + baseRadius + 20}
                    textAnchor="middle"
                    fill="#212529"
                    fontSize="11"
                    fontWeight="500"
                    opacity={nodeOpacity * 0.9}
                    style={{
                      pointerEvents: 'none',
                    }}
                  >
                    {world.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          border: '1px solid #dee2e6',
        }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#212529' }}>Legend:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#FFD700',
                border: '2px solid #FFD700',
              }} />
              <span style={{ color: '#212529' }}>Current Position</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                border: '2px solid #4CAF50',
              }} />
              <span style={{ color: '#212529' }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#2196F3',
                border: '2px solid #2196F3',
                opacity: 0.7,
              }} />
              <span style={{ color: '#212529' }}>Visited</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#999',
                border: '2px solid #999',
                opacity: 0.5,
              }} />
              <span style={{ color: '#212529' }}>Unreachable</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

