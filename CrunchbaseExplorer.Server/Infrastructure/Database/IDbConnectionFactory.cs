using System.Data;

namespace CrunchbaseExplorer.Server.Infrastructure.Database;

/// <summary>
/// Factory for creating database connections
/// </summary>
public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
    Task<IDbConnection> CreateConnectionAsync(CancellationToken cancellationToken = default);
}
